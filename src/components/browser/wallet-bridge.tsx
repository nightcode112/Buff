"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  Transaction,
  VersionedTransaction,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";

const BUFF_CHANNEL = "buff-dapp-browser";

interface SerializedIx {
  programId: string;
  keys: Array<{ pubkey: string; isSigner: boolean; isWritable: boolean }>;
  data: string; // base64
}

/** Deserialize a base64-encoded instruction from /api/browse/wrap */
function deserializeInstruction(encoded: string): SerializedIx {
  const json = atob(encoded);
  return JSON.parse(json);
}

/** Convert a serialized instruction to a web3.js TransactionInstruction */
function toTransactionInstruction(ix: SerializedIx): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(ix.programId),
    keys: ix.keys.map((k) => ({
      pubkey: new PublicKey(k.pubkey),
      isSigner: k.isSigner,
      isWritable: k.isWritable,
    })),
    data: Buffer.from(ix.data, "base64"),
  });
}

interface WalletBridgeProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  mainWallet: string | null;
  buffWallet: string | null;
  signature: Uint8Array | null;
  buffEnabled: boolean;
  onRoundUp: (amount: number) => void;
}

/**
 * Estimate SOL value from raw transaction bytes by scanning for
 * SystemProgram.transfer instructions.
 *
 * SystemProgram.transfer layout:
 *   - instruction index: u32 LE = 2
 *   - lamports: u64 LE
 *
 * Transaction format (legacy):
 *   - signatures section, then message section
 *   - message: header (3 bytes), account keys, recent blockhash, instructions
 *
 * This is a best-effort parser. On failure we return a default value
 * so the round-up still triggers.
 */
function estimateTxValueSol(txBytes: Uint8Array): number {
  try {
    if (txBytes.length < 100) return 0.01;

    // Skip signatures: first byte = number of signatures, each 64 bytes
    const numSigs = txBytes[0];
    let offset = 1 + numSigs * 64;
    if (offset >= txBytes.length) return 0.01;

    // Message header: numRequiredSignatures(1) + numReadonlySignedAccounts(1) + numReadonlyUnsignedAccounts(1)
    offset += 3;

    // Compact-u16 for number of account keys
    const numAccountKeys = readCompactU16(txBytes, offset);
    offset = numAccountKeys.offset;

    // Skip account keys (32 bytes each)
    const accountKeysStart = offset;
    offset += numAccountKeys.value * 32;

    // Skip recent blockhash (32 bytes)
    offset += 32;

    // Compact-u16 for number of instructions
    const numInstructions = readCompactU16(txBytes, offset);
    offset = numInstructions.offset;

    let totalLamports = 0;

    for (let i = 0; i < numInstructions.value; i++) {
      if (offset >= txBytes.length) break;

      // Program ID index (1 byte)
      const programIdIndex = txBytes[offset++];

      // Check if this instruction uses SystemProgram
      const programIdStart = accountKeysStart + programIdIndex * 32;
      let isSystemProgram = true;
      // SystemProgram is all zeros except... actually it's 0x000...001 in the last position
      // Let's compare the base58-decoded bytes
      // Actually, just check if all 32 bytes match the system program
      // System program = 0x00 * 32 (the address is "1111...1111" which decodes to all zeros)
      for (let b = 0; b < 32; b++) {
        if (txBytes[programIdStart + b] !== 0) {
          isSystemProgram = false;
          break;
        }
      }

      // Compact-u16 for number of account indexes
      const numAccounts = readCompactU16(txBytes, offset);
      offset = numAccounts.offset;

      // Skip account indexes
      offset += numAccounts.value;

      // Compact-u16 for data length
      const dataLen = readCompactU16(txBytes, offset);
      offset = dataLen.offset;

      if (isSystemProgram && dataLen.value >= 12) {
        // Read instruction index (u32 LE)
        const ixIndex =
          txBytes[offset] |
          (txBytes[offset + 1] << 8) |
          (txBytes[offset + 2] << 16) |
          (txBytes[offset + 3] << 24);

        if (ixIndex === 2) {
          // Transfer instruction — read lamports (u64 LE)
          let lamports = 0;
          for (let j = 0; j < 8; j++) {
            lamports += txBytes[offset + 4 + j] * 2 ** (8 * j);
          }
          totalLamports += lamports;
        }
      }

      // Skip instruction data
      offset += dataLen.value;
    }

    if (totalLamports > 0) {
      return totalLamports / 1_000_000_000;
    }

    // Couldn't find transfers — return default so round-up still applies
    return 0.01;
  } catch {
    return 0.01;
  }
}

/** Read a compact-u16 (Solana's variable-length encoding) */
function readCompactU16(
  bytes: Uint8Array,
  offset: number
): { value: number; offset: number } {
  let value = 0;
  let shift = 0;
  let pos = offset;

  for (let i = 0; i < 3; i++) {
    const b = bytes[pos++];
    value |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) break;
    shift += 7;
  }

  return { value, offset: pos };
}

export function WalletBridge({
  iframeRef,
  mainWallet,
  buffWallet,
  signature,
  buffEnabled,
  onRoundUp,
}: WalletBridgeProps) {
  const [lastRoundUp, setLastRoundUp] = useState<number | null>(null);
  const [sessionRoundUps, setSessionRoundUps] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const processingRef = useRef(false);

  const sendToIframe = useCallback(
    (id: string, payload: Record<string, unknown>) => {
      iframeRef.current?.contentWindow?.postMessage(
        { channel: BUFF_CHANNEL, id, payload },
        "*"
      );
    },
    [iframeRef]
  );

  // Handle messages from the iframe
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      if (event.data?.channel !== BUFF_CHANNEL) return;
      const { type, id, payload } = event.data;

      switch (type) {
        case "REQUEST_AUTO_CONNECT": {
          if (mainWallet) {
            iframeRef.current?.contentWindow?.postMessage(
              {
                channel: BUFF_CHANNEL,
                type: "AUTO_CONNECT",
                payload: { pubkey: mainWallet },
              },
              "*"
            );
          }
          break;
        }

        case "WALLET_CONNECT": {
          if (mainWallet) {
            sendToIframe(id, { pubkey: mainWallet });
          } else {
            sendToIframe(id, { error: "No wallet connected to Buff" });
          }
          break;
        }

        case "WALLET_DISCONNECT": {
          break;
        }

        case "SIGN_TRANSACTION": {
          await handleSignTransaction(id, payload);
          break;
        }

        case "SIGN_ALL_TRANSACTIONS": {
          await handleSignAllTransactions(id, payload);
          break;
        }

        case "SIGN_MESSAGE": {
          await handleSignMessage(id, payload);
          break;
        }

        case "SIGN_AND_SEND_TRANSACTION": {
          await handleSignAndSendTransaction(id, payload);
          break;
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainWallet, buffWallet, signature, buffEnabled]);

  const getWalletProvider = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    return w.phantom?.solana ?? w.solana ?? w.solflare ?? null;
  };

  const getRoundUpInstructions = async (
    txBase64: string
  ): Promise<TransactionInstruction[]> => {
    if (!buffEnabled || !mainWallet || !buffWallet) return [];

    try {
      // Parse the transaction bytes to estimate value
      const txBytes = Uint8Array.from(atob(txBase64), (c) =>
        c.charCodeAt(0)
      );
      const solValue = estimateTxValueSol(txBytes);

      // Get SOL price
      const priceRes = await fetch("/api/price");
      const priceData = await priceRes.json();
      const solPrice = priceData?.data?.SOL || 0;

      if (solPrice <= 0) return [];

      const usdValue = solValue * solPrice;
      if (usdValue < 0.01) return [];

      // Get round-up instructions from internal browse wrap endpoint (no auth needed)
      const wrapRes = await fetch("/api/browse/wrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txValueUsd: usdValue,
          userPubkey: mainWallet,
          buffWalletPubkey: buffWallet,
        }),
      });

      const wrapData = await wrapRes.json();
      if (!wrapData.ok || !wrapData.data?.instructions?.length) return [];

      // Track round-up
      const roundUpUsd = wrapData.data.breakdown?.roundUpUsd || 0;
      if (roundUpUsd > 0) {
        setLastRoundUp(roundUpUsd);
        setSessionRoundUps((c) => c + 1);
        setSessionTotal((c) => c + roundUpUsd);
        onRoundUp(roundUpUsd);
      }

      // Deserialize into real TransactionInstruction objects
      return (wrapData.data.instructions as string[]).map((encoded: string) => {
        const serialized = deserializeInstruction(encoded);
        return toTransactionInstruction(serialized);
      });
    } catch (err) {
      console.warn("[Buff Bridge] Round-up error (fail-open):", err);
      return [];
    }
  };

  /** Deserialize raw tx bytes into a Transaction or VersionedTransaction */
  const deserializeTx = (txBytes: Uint8Array): Transaction | VersionedTransaction => {
    try {
      return VersionedTransaction.deserialize(txBytes);
    } catch {
      return Transaction.from(txBytes);
    }
  };

  /** Append round-up instructions to a legacy Transaction (fail-open) */
  const appendToTx = (
    tx: Transaction | VersionedTransaction,
    instructions: TransactionInstruction[]
  ): Transaction | VersionedTransaction => {
    if (instructions.length === 0) return tx;

    // Can only append to legacy Transaction (has .add() method)
    if (tx instanceof Transaction) {
      for (const ix of instructions) {
        tx.add(ix);
      }
    } else {
      // VersionedTransaction — skip modification for now (fail-open)
      console.warn("[Buff Bridge] Cannot append to VersionedTransaction, skipping round-up");
    }
    return tx;
  };

  const handleSignTransaction = async (
    id: string,
    payload: { transaction: string }
  ) => {
    if (processingRef.current) {
      sendToIframe(id, { error: "Already processing a transaction" });
      return;
    }
    processingRef.current = true;

    try {
      const provider = getWalletProvider();
      if (!provider) {
        sendToIframe(id, { error: "No wallet provider available" });
        return;
      }

      // Deserialize the transaction
      const txBytes = Uint8Array.from(atob(payload.transaction), (c) =>
        c.charCodeAt(0)
      );
      let tx = deserializeTx(txBytes);

      // Get round-up instructions and append them (fail-open)
      try {
        const roundUpIxs = await getRoundUpInstructions(payload.transaction);
        tx = appendToTx(tx, roundUpIxs);
      } catch (err) {
        console.warn("[Buff Bridge] Round-up append failed (fail-open):", err);
      }

      // Sign the (possibly modified) transaction with the real wallet
      const signed = await provider.signTransaction(tx);
      const signedBytes = signed.serialize();
      const signedBase64 = btoa(
        String.fromCharCode.apply(
          null,
          Array.from(new Uint8Array(signedBytes))
        )
      );

      sendToIframe(id, { signedTransaction: signedBase64 });
    } catch (err) {
      sendToIframe(id, {
        error: err instanceof Error ? err.message : "Sign failed",
      });
    } finally {
      processingRef.current = false;
    }
  };

  const handleSignAllTransactions = async (
    id: string,
    payload: { transactions: string[] }
  ) => {
    if (processingRef.current) {
      sendToIframe(id, { error: "Already processing" });
      return;
    }
    processingRef.current = true;

    try {
      const provider = getWalletProvider();
      if (!provider) {
        sendToIframe(id, { error: "No wallet provider" });
        return;
      }

      const txs = payload.transactions.map((b64) => {
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        return deserializeTx(bytes);
      });

      // Add round-up to the last transaction (fail-open)
      if (txs.length > 0) {
        try {
          const lastIdx = txs.length - 1;
          const roundUpIxs = await getRoundUpInstructions(
            payload.transactions[lastIdx]
          );
          txs[lastIdx] = appendToTx(txs[lastIdx], roundUpIxs);
        } catch (err) {
          console.warn("[Buff Bridge] Round-up append failed (fail-open):", err);
        }
      }

      const signed = await provider.signAllTransactions(txs);
      const signedBase64s = signed.map(
        (s: { serialize: () => Uint8Array }) => {
          const bytes = s.serialize();
          return btoa(
            String.fromCharCode.apply(
              null,
              Array.from(new Uint8Array(bytes))
            )
          );
        }
      );

      sendToIframe(id, { signedTransactions: signedBase64s });
    } catch (err) {
      sendToIframe(id, {
        error: err instanceof Error ? err.message : "Sign all failed",
      });
    } finally {
      processingRef.current = false;
    }
  };

  const handleSignMessage = async (
    id: string,
    payload: { message: string; display?: string }
  ) => {
    try {
      const provider = getWalletProvider();
      if (!provider) {
        sendToIframe(id, { error: "No wallet provider" });
        return;
      }

      const msgBytes = Uint8Array.from(atob(payload.message), (c) =>
        c.charCodeAt(0)
      );
      const result = await provider.signMessage(
        msgBytes,
        payload.display || "utf8"
      );
      const sigBase64 = btoa(
        String.fromCharCode.apply(
          null,
          Array.from(new Uint8Array(result.signature))
        )
      );

      sendToIframe(id, { signature: sigBase64 });
    } catch (err) {
      sendToIframe(id, {
        error: err instanceof Error ? err.message : "Sign message failed",
      });
    }
  };

  const handleSignAndSendTransaction = async (
    id: string,
    payload: { transaction: string; options?: Record<string, unknown> }
  ) => {
    if (processingRef.current) {
      sendToIframe(id, { error: "Already processing" });
      return;
    }
    processingRef.current = true;

    try {
      const provider = getWalletProvider();
      if (!provider) {
        sendToIframe(id, { error: "No wallet provider" });
        return;
      }

      const txBytes = Uint8Array.from(atob(payload.transaction), (c) =>
        c.charCodeAt(0)
      );
      let tx = deserializeTx(txBytes);

      // Append round-up instructions (fail-open)
      try {
        const roundUpIxs = await getRoundUpInstructions(payload.transaction);
        tx = appendToTx(tx, roundUpIxs);
      } catch (err) {
        console.warn("[Buff Bridge] Round-up append failed (fail-open):", err);
      }

      if (provider.signAndSendTransaction) {
        const result = await provider.signAndSendTransaction(
          tx,
          payload.options
        );
        sendToIframe(id, { signature: result.signature });
      } else {
        const signed = await provider.signTransaction(tx);
        sendToIframe(id, {
          signedTransaction: btoa(
            String.fromCharCode.apply(
              null,
              Array.from(new Uint8Array(signed.serialize()))
            )
          ),
        });
      }
    } catch (err) {
      sendToIframe(id, {
        error: err instanceof Error ? err.message : "Sign and send failed",
      });
    } finally {
      processingRef.current = false;
    }
  };

  // Status bar
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 border-t border-border/30 rounded-b-xl text-xs">
      <div className="flex items-center gap-3">
        <span
          className={`flex items-center gap-1.5 ${buffEnabled ? "text-gold" : "text-muted-foreground"}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${buffEnabled ? "bg-sage" : "bg-muted-foreground"}`}
          />
          {buffEnabled ? "Round-ups active" : "Round-ups paused"}
        </span>
        {mainWallet && (
          <span className="text-muted-foreground font-mono">
            {mainWallet.slice(0, 4)}...{mainWallet.slice(-4)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 text-muted-foreground">
        {sessionRoundUps > 0 && (
          <>
            <span>
              {sessionRoundUps} round-up
              {sessionRoundUps !== 1 ? "s" : ""}
            </span>
            <span className="text-gold font-semibold">
              ${sessionTotal.toFixed(2)} total
            </span>
          </>
        )}
        {lastRoundUp !== null && (
          <span className="text-sage font-semibold animate-pulse">
            +${lastRoundUp.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
