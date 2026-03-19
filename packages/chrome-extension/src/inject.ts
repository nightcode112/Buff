export {}; // Make this file a module to avoid global scope conflicts

/**
 * Inject Script — Page Context Wallet Proxy
 *
 * Runs in the page context (not content script sandbox).
 * Wraps window.solana / window.solflare to intercept signTransaction
 * and signAllTransactions. Appends round-up instructions from the
 * Buff API before passing to the real wallet.
 *
 * CRITICAL: Fail-open. If anything fails, pass tx through unmodified.
 * The user must NEVER have a transaction blocked by this extension.
 */

const BUFF_CHANNEL = "buff-extension";
const SYSTEM_PROGRAM = "11111111111111111111111111111111";

// ── Message bridge to content script ──

let messageId = 0;
const pendingRequests = new Map<
  string,
  { resolve: (v: unknown) => void; reject: (e: Error) => void }
>();

function sendToBackground(type: string, payload: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const id = `buff-${++messageId}-${Date.now()}`;
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      resolve({ skip: true }); // Fail-open on timeout
    }, 8000);

    pendingRequests.set(id, {
      resolve: (v) => {
        clearTimeout(timeout);
        resolve(v);
      },
      reject: (e) => {
        clearTimeout(timeout);
        reject(e);
      },
    });

    window.postMessage({ channel: BUFF_CHANNEL, type, id, payload }, "*");
  });
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.channel !== BUFF_CHANNEL) return;

  const { id, payload } = event.data;
  const pending = pendingRequests.get(id);
  if (pending) {
    pendingRequests.delete(id);
    pending.resolve(payload);
  }
});

// ── Transaction value estimation ──

function estimateTxValueFromInstructions(tx: LegacyTx): number {
  let totalLamports = 0;

  try {
    const instructions = tx.instructions || [];
    for (const ix of instructions) {
      const progId =
        typeof ix.programId === "string"
          ? ix.programId
          : ix.programId?.toBase58?.() || ix.programId?.toString?.() || "";

      if (progId !== SYSTEM_PROGRAM) continue;

      const data = ix.data;
      if (!data || data.length < 12) continue;

      // SystemProgram.transfer: index=2 (u32 LE), then lamports (u64 LE)
      const ixIndex = data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24);
      if (ixIndex !== 2) continue;

      let lamports = 0;
      for (let i = 0; i < 8; i++) {
        lamports += data[4 + i] * 2 ** (8 * i);
      }
      totalLamports += lamports;
    }
  } catch {
    // If we can't parse, return 0 — the API will handle it
  }

  return totalLamports / 1_000_000_000;
}

// ── Instruction appending ──

interface SerializedIx {
  programId: string;
  keys: Array<{ pubkey: string; isSigner: boolean; isWritable: boolean }>;
  data: string; // base64
}

interface LegacyTx {
  instructions?: Array<{
    programId: { toBase58?: () => string; toString?: () => string } | string;
    data: Uint8Array;
    keys: Array<{ pubkey: { toBase58?: () => string } | string; isSigner: boolean; isWritable: boolean }>;
  }>;
  add?: (...args: unknown[]) => void;
  feePayer?: { toBase58?: () => string } | string;
  serialize?: () => Uint8Array;
  compileMessage?: () => unknown;
  // VersionedTransaction fields
  message?: {
    compiledInstructions?: unknown[];
    staticAccountKeys?: Array<{ toBase58?: () => string }>;
    addressTableLookups?: unknown[];
    header?: unknown;
  };
  version?: number | "legacy";
}

function isVersionedTransaction(tx: LegacyTx): boolean {
  return tx.version !== undefined && tx.version !== "legacy" && !!tx.message?.compiledInstructions;
}

async function appendInstructions(
  tx: LegacyTx,
  instructions: SerializedIx[]
): Promise<LegacyTx> {
  // For VersionedTransaction, we need web3.js to decompile/recompile
  if (isVersionedTransaction(tx)) {
    // If the transaction uses address lookup tables, we can't safely modify it
    if (tx.message?.addressTableLookups && (tx.message.addressTableLookups as unknown[]).length > 0) {
      console.warn("[Buff] VersionedTransaction with lookup tables — skipping round-up");
      return tx;
    }

    try {
      return appendToVersionedTransaction(tx, instructions);
    } catch (err) {
      console.warn("[Buff] Failed to modify VersionedTransaction:", err);
      return tx; // Fail-open
    }
  }

  // Legacy Transaction — use .add() method
  if (typeof tx.add === "function") {
    for (const ix of instructions) {
      try {
        // Dynamically create TransactionInstruction-like objects
        // that work with the web3.js Transaction.add() method
        const ixObj = createInstructionObject(ix);
        tx.add(ixObj);
      } catch (err) {
        console.warn("[Buff] Failed to add instruction:", err);
        // Fail-open: return original tx
        return tx;
      }
    }
  }

  return tx;
}

function createInstructionObject(ix: SerializedIx): unknown {
  // We need to create objects that the Transaction.add() method accepts.
  // It expects TransactionInstruction-like objects with:
  //   - programId: PublicKey
  //   - keys: Array<{ pubkey: PublicKey, isSigner, isWritable }>
  //   - data: Buffer

  // Since we're in page context, we can use whatever web3.js the dApp loaded
  const web3 = ((window as unknown as Record<string, unknown>)).__buffWeb3 as {
    PublicKey: new (s: string) => unknown;
    TransactionInstruction: new (opts: unknown) => unknown;
  } | undefined;

  if (web3?.TransactionInstruction) {
    return new web3.TransactionInstruction({
      programId: new web3.PublicKey(ix.programId),
      keys: ix.keys.map((k) => ({
        pubkey: new web3.PublicKey(k.pubkey),
        isSigner: k.isSigner,
        isWritable: k.isWritable,
      })),
      data: Uint8Array.from(atob(ix.data), (c) => c.charCodeAt(0)),
    });
  }

  // Fallback: construct a plain object that quacks like TransactionInstruction
  // Most web3.js Transaction.add() implementations check for these fields
  const dataBytes = Uint8Array.from(atob(ix.data), (c) => c.charCodeAt(0));

  return {
    programId: createPubKeyLike(ix.programId),
    keys: ix.keys.map((k) => ({
      pubkey: createPubKeyLike(k.pubkey),
      isSigner: k.isSigner,
      isWritable: k.isWritable,
    })),
    data: dataBytes,
  };
}

function createPubKeyLike(base58: string) {
  return {
    toBase58: () => base58,
    toString: () => base58,
    toBuffer: () => decodeBase58(base58),
    toBytes: () => decodeBase58(base58),
    equals: (other: { toBase58?: () => string }) =>
      other?.toBase58?.() === base58,
  };
}

function decodeBase58(str: string): Uint8Array {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes: number[] = [];
  for (const char of str) {
    let carry = ALPHABET.indexOf(char);
    if (carry < 0) throw new Error("Invalid base58 char");
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  // Leading zeros
  for (const char of str) {
    if (char !== "1") break;
    bytes.push(0);
  }
  return new Uint8Array(bytes.reverse());
}

function appendToVersionedTransaction(
  tx: LegacyTx,
  instructions: SerializedIx[]
): LegacyTx {
  // For VersionedTransaction without lookup tables, we can manipulate
  // the compiled message directly. This is a simplified approach.
  // In practice, we'd need the full web3.js library which the dApp provides.

  const msg = tx.message;
  if (!msg || !msg.compiledInstructions || !msg.staticAccountKeys) {
    throw new Error("Invalid VersionedTransaction message");
  }

  const accountKeys = [...msg.staticAccountKeys];

  for (const ix of instructions) {
    // Add accounts that aren't already in the key list
    const programIdIdx = findOrAddKey(accountKeys, ix.programId);

    const keyIndices: number[] = [];
    for (const k of ix.keys) {
      keyIndices.push(findOrAddKey(accountKeys, k.pubkey));
    }

    const dataBytes = Uint8Array.from(atob(ix.data), (c) => c.charCodeAt(0));

    (msg.compiledInstructions as unknown[]).push({
      programIdIndex: programIdIdx,
      accountKeyIndexes: keyIndices,
      data: dataBytes,
    });
  }

  msg.staticAccountKeys = accountKeys;
  return tx;
}

function findOrAddKey(
  keys: Array<{ toBase58?: () => string }>,
  base58: string
): number {
  const idx = keys.findIndex((k) => k.toBase58?.() === base58);
  if (idx >= 0) return idx;
  keys.push(createPubKeyLike(base58));
  return keys.length - 1;
}

// ── Get user pubkey from transaction ──

function getUserPubkey(tx: LegacyTx): string | null {
  try {
    // Legacy: feePayer
    if (tx.feePayer) {
      const fp = tx.feePayer;
      if (typeof fp === "string") return fp;
      if (fp.toBase58) return fp.toBase58();
    }

    // VersionedTransaction: first static account key is fee payer
    if (tx.message?.staticAccountKeys?.[0]) {
      return tx.message.staticAccountKeys[0].toBase58?.() || null;
    }

    // Try instructions[0].keys[0] (usually the signer)
    if (tx.instructions?.[0]?.keys?.[0]) {
      const k = tx.instructions[0].keys[0].pubkey;
      if (typeof k === "string") return k;
      if (k.toBase58) return k.toBase58();
    }
  } catch {}

  return null;
}

// ── Core interception ──

async function interceptSignTransaction(
  realSign: (tx: LegacyTx) => Promise<LegacyTx>,
  tx: LegacyTx
): Promise<LegacyTx> {
  try {
    // Get state from background
    const state = (await sendToBackground("BUFF_GET_STATE", {})) as {
      enabled?: boolean;
      authenticated?: boolean;
    };

    if (!state?.enabled || !state?.authenticated) {
      return realSign(tx);
    }

    // Estimate value
    const solValue = estimateTxValueFromInstructions(tx);

    // Get SOL price
    const priceResult = (await sendToBackground("BUFF_GET_PRICE", {})) as {
      solPrice?: number | null;
    };
    const solPrice = priceResult?.solPrice;

    if (!solPrice || solPrice <= 0) {
      return realSign(tx);
    }

    const usdValue = solValue * solPrice;

    // Skip tiny transactions (< $0.01 USD)
    if (usdValue < 0.01) {
      return realSign(tx);
    }

    const userPubkey = getUserPubkey(tx);
    if (!userPubkey) {
      return realSign(tx);
    }

    // Request wrap instructions from background → API
    const wrapResult = (await sendToBackground("BUFF_WRAP_REQUEST", {
      txValueUsd: usdValue,
      userPubkey,
    })) as {
      success?: boolean;
      skip?: boolean;
      instructions?: SerializedIx[];
    };

    if (!wrapResult?.success || wrapResult.skip || !wrapResult.instructions?.length) {
      return realSign(tx);
    }

    // Append instructions to the transaction
    const modifiedTx = await appendInstructions(tx, wrapResult.instructions);

    // Pass to the REAL wallet signer — user sees ONE popup
    return realSign(modifiedTx);
  } catch (err) {
    // FAIL-OPEN: always pass through on error
    console.warn("[Buff] Interception error, passing through:", err);
    return realSign(tx);
  }
}

async function interceptSignAllTransactions(
  realSignAll: (txs: LegacyTx[]) => Promise<LegacyTx[]>,
  txs: LegacyTx[]
): Promise<LegacyTx[]> {
  try {
    const state = (await sendToBackground("BUFF_GET_STATE", {})) as {
      enabled?: boolean;
      authenticated?: boolean;
    };

    if (!state?.enabled || !state?.authenticated) {
      return realSignAll(txs);
    }

    // Process each transaction
    const modifiedTxs: LegacyTx[] = [];
    for (const tx of txs) {
      const solValue = estimateTxValueFromInstructions(tx);

      const priceResult = (await sendToBackground("BUFF_GET_PRICE", {})) as {
        solPrice?: number | null;
      };
      const solPrice = priceResult?.solPrice;

      if (!solPrice || solPrice <= 0 || solValue * solPrice < 0.01) {
        modifiedTxs.push(tx);
        continue;
      }

      const userPubkey = getUserPubkey(tx);
      if (!userPubkey) {
        modifiedTxs.push(tx);
        continue;
      }

      const wrapResult = (await sendToBackground("BUFF_WRAP_REQUEST", {
        txValueUsd: solValue * solPrice,
        userPubkey,
      })) as {
        success?: boolean;
        skip?: boolean;
        instructions?: SerializedIx[];
      };

      if (wrapResult?.success && !wrapResult.skip && wrapResult.instructions?.length) {
        const modified = await appendInstructions(tx, wrapResult.instructions);
        modifiedTxs.push(modified);
      } else {
        modifiedTxs.push(tx);
      }
    }

    return realSignAll(modifiedTxs);
  } catch (err) {
    console.warn("[Buff] signAllTransactions error, passing through:", err);
    return realSignAll(txs);
  }
}

// ── Wallet proxy setup ──

function wrapWalletProvider(provider: Record<string, unknown>, name: string) {
  if ((provider as { __buffWrapped?: boolean }).__buffWrapped) return;

  const realSignTransaction = provider.signTransaction as (
    tx: LegacyTx
  ) => Promise<LegacyTx>;
  const realSignAllTransactions = provider.signAllTransactions as (
    txs: LegacyTx[]
  ) => Promise<LegacyTx[]>;

  if (typeof realSignTransaction === "function") {
    provider.signTransaction = function (tx: LegacyTx) {
      return interceptSignTransaction(
        realSignTransaction.bind(provider),
        tx
      );
    };
  }

  if (typeof realSignAllTransactions === "function") {
    provider.signAllTransactions = function (txs: LegacyTx[]) {
      return interceptSignAllTransactions(
        realSignAllTransactions.bind(provider),
        txs
      );
    };
  }

  (provider as { __buffWrapped?: boolean }).__buffWrapped = true;
  console.log(`[Buff] Wrapped ${name} wallet provider`);
}

function tryWrapProviders() {
  const win = (window as unknown as Record<string, unknown>);

  // Phantom
  const phantom = win.phantom as Record<string, unknown> | undefined;
  if (phantom?.solana) {
    wrapWalletProvider(phantom.solana as Record<string, unknown>, "phantom.solana");
  }

  // window.solana (Phantom legacy)
  if (win.solana && typeof win.solana === "object") {
    wrapWalletProvider(win.solana as Record<string, unknown>, "solana");
  }

  // Solflare
  if (win.solflare && typeof win.solflare === "object") {
    wrapWalletProvider(win.solflare as Record<string, unknown>, "solflare");
  }

  // Backpack
  const backpack = win.backpack as Record<string, unknown> | undefined;
  if (backpack) {
    wrapWalletProvider(backpack as Record<string, unknown>, "backpack");
  }
}

// ── Trap wallet injection via Object.defineProperty ──

function trapWalletProperty(propName: string) {
  const win = (window as unknown as Record<string, unknown>);
  let currentValue = win[propName];

  // If already set, wrap it now
  if (currentValue && typeof currentValue === "object") {
    wrapWalletProvider(currentValue as Record<string, unknown>, propName);
  }

  try {
    Object.defineProperty(window, propName, {
      configurable: true,
      get() {
        return currentValue;
      },
      set(val) {
        currentValue = val;
        if (val && typeof val === "object") {
          // Small delay to let the wallet fully initialize
          setTimeout(() => {
            wrapWalletProvider(val as Record<string, unknown>, propName);
          }, 0);
        }
      },
    });
  } catch {
    // Some wallets may already have defined this property non-configurable
    // Fall back to polling
  }
}

// ── Also trap phantom.solana ──

function trapPhantom() {
  const win = (window as unknown as Record<string, unknown>);
  let phantomVal = win.phantom;

  if (phantomVal && typeof phantomVal === "object") {
    const p = phantomVal as Record<string, unknown>;
    if (p.solana && typeof p.solana === "object") {
      wrapWalletProvider(p.solana as Record<string, unknown>, "phantom.solana");
    }
  }

  try {
    Object.defineProperty(window, "phantom", {
      configurable: true,
      get() {
        return phantomVal;
      },
      set(val) {
        phantomVal = val;
        if (val && typeof val === "object") {
          const p = val as Record<string, unknown>;
          // Trap phantom.solana
          let solanaVal = p.solana;
          try {
            Object.defineProperty(p, "solana", {
              configurable: true,
              get() {
                return solanaVal;
              },
              set(s) {
                solanaVal = s;
                if (s && typeof s === "object") {
                  setTimeout(() => {
                    wrapWalletProvider(s as Record<string, unknown>, "phantom.solana");
                  }, 0);
                }
              },
            });
          } catch {}

          if (solanaVal && typeof solanaVal === "object") {
            setTimeout(() => {
              wrapWalletProvider(solanaVal as Record<string, unknown>, "phantom.solana");
            }, 0);
          }
        }
      },
    });
  } catch {}
}

// ── Initialize ──

trapPhantom();
trapWalletProperty("solana");
trapWalletProperty("solflare");
trapWalletProperty("backpack");

// Fallback poll for late-loading wallets
setTimeout(tryWrapProviders, 1000);
setTimeout(tryWrapProviders, 3000);
setTimeout(tryWrapProviders, 5000);

// ── Wallet connect/sign handlers (for popup onboarding) ──
// The popup can't access window.solana directly, so it sends messages
// through background → content → inject (here) to interact with the wallet.

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.channel !== BUFF_CHANNEL) return;

  const { type, id } = event.data;

  if (type === "BUFF_WALLET_CONNECT") {
    handleWalletConnect(id);
  } else if (type === "BUFF_WALLET_SIGN") {
    const { message: authMsg } = event.data.payload as { message: string };
    handleWalletSign(id, authMsg);
  }
});

async function handleWalletConnect(id: string) {
  try {
    const win = (window as unknown as Record<string, unknown>);
    const phantom = win.phantom as Record<string, { connect?: () => Promise<{ publicKey: { toBase58(): string } }> }> | undefined;
    const provider =
      phantom?.solana ??
      (win.solana as { connect?: () => Promise<{ publicKey: { toBase58(): string } }> } | undefined) ??
      (win.solflare as { connect?: () => Promise<{ publicKey: { toBase58(): string } }> } | undefined);

    if (!provider || !provider.connect) {
      window.postMessage({
        channel: BUFF_CHANNEL,
        type: "BUFF_WALLET_CONNECT_RESPONSE",
        id,
        payload: { error: "No Solana wallet found. Please install Phantom." },
      }, "*");
      return;
    }

    const resp = await provider.connect();
    const pubkey = resp.publicKey.toBase58();

    window.postMessage({
      channel: BUFF_CHANNEL,
      type: "BUFF_WALLET_CONNECT_RESPONSE",
      id,
      payload: { pubkey },
    }, "*");
  } catch (err) {
    window.postMessage({
      channel: BUFF_CHANNEL,
      type: "BUFF_WALLET_CONNECT_RESPONSE",
      id,
      payload: { error: err instanceof Error ? err.message : "Wallet connect failed" },
    }, "*");
  }
}

async function handleWalletSign(id: string, authMessage: string) {
  try {
    const win = (window as unknown as Record<string, unknown>);
    const phantom = win.phantom as Record<string, { signMessage?: (msg: Uint8Array, enc: string) => Promise<{ signature: Uint8Array }> }> | undefined;
    const provider =
      phantom?.solana ??
      (win.solana as { signMessage?: (msg: Uint8Array, enc: string) => Promise<{ signature: Uint8Array }> } | undefined) ??
      (win.solflare as { signMessage?: (msg: Uint8Array, enc: string) => Promise<{ signature: Uint8Array }> } | undefined);

    if (!provider || !provider.signMessage) {
      window.postMessage({
        channel: BUFF_CHANNEL,
        type: "BUFF_WALLET_SIGN_RESPONSE",
        id,
        payload: { error: "Wallet does not support signMessage" },
      }, "*");
      return;
    }

    const message = new TextEncoder().encode(authMessage);
    const { signature: sigBytes } = await provider.signMessage(message, "utf8");

    // Convert to base64
    let binary = "";
    for (let i = 0; i < sigBytes.length; i++) {
      binary += String.fromCharCode(sigBytes[i]);
    }
    const signatureBase64 = btoa(binary);

    window.postMessage({
      channel: BUFF_CHANNEL,
      type: "BUFF_WALLET_SIGN_RESPONSE",
      id,
      payload: { signature: signatureBase64 },
    }, "*");
  } catch (err) {
    window.postMessage({
      channel: BUFF_CHANNEL,
      type: "BUFF_WALLET_SIGN_RESPONSE",
      id,
      payload: { error: err instanceof Error ? err.message : "Signing failed" },
    }, "*");
  }
}

console.log("[Buff] Inject script loaded — wallet interception active");
