"use client";

import { useState, useEffect } from "react";

interface PortfolioData {
  walletAddress: string;
  balances: Array<{
    asset: string;
    mint: string;
    balance: string;
    usdValue: number;
  }>;
  totalUsd: number;
  pendingSol: number;
  pendingUsd: number;
  solPriceUsd: number;
  network: string;
}

interface AccumulatorData {
  balanceSol: number;
  balanceUsd: number;
  solPriceUsd: number;
  thresholdUsd: number;
  thresholdReached: boolean;
  remaining: number;
}

function ExportSection({ signature }: { signature: Uint8Array | null }) {
  const [revealed, setRevealed] = useState(false);
  const [privateKeyB58, setPrivateKeyB58] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReveal = async () => {
    if (!signature) return;

    // SHA-256 the signature to get the 32-byte seed
    const hashBuffer = await crypto.subtle.digest("SHA-256", new Uint8Array(signature));
    const seed = new Uint8Array(hashBuffer);

    // Derive ed25519 keypair from seed using tweetnacl
    const nacl = await import("tweetnacl");
    const keypair = nacl.sign.keyPair.fromSeed(seed);
    // keypair.secretKey is 64 bytes (seed + pubkey) — this is what Phantom expects

    // Encode as base58
    const bs58 = await import("bs58");
    const b58 = bs58.default.encode(keypair.secretKey);

    setPrivateKeyB58(b58);
    setRevealed(true);
  };

  const handleCopy = () => {
    if (privateKeyB58) {
      navigator.clipboard.writeText(privateKeyB58);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!signature) {
    return (
      <div className="premium-card rounded-2xl p-6">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Export Wallet</div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground shrink-0">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <p className="text-xs text-muted-foreground">Connect your wallet (not manual address) to enable export.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card rounded-2xl p-6">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Export Wallet</div>
      <p className="text-sm text-muted-foreground mb-4">
        Export your Buff wallet seed to import into Phantom, Solflare, or any Solana wallet. You have full control of your funds.
      </p>

      {!revealed ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.04] border border-red-500/15">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-red-400 shrink-0">
              <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-red-400/80">Never share your seed with anyone. Anyone with this seed has full access to your Buff wallet funds.</p>
          </div>
          <button onClick={handleReveal} className="w-full py-3 rounded-xl text-sm font-bold border border-red-500/20 text-red-400 hover:bg-red-500/5 transition-colors">
            Reveal Wallet Seed
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <code className="block text-[11px] font-mono bg-secondary/50 px-4 py-3 rounded-xl break-all text-foreground/80 border border-border/30 leading-5">
              {privateKeyB58}
            </code>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 text-xs text-muted-foreground hover:text-gold bg-secondary/80 px-2.5 py-1 rounded-md border border-border/30 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground/70">To import into Phantom:</p>
            <p>1. Open Phantom &rarr; Settings &rarr; Manage Accounts</p>
            <p>2. Click &quot;Import Private Key&quot;</p>
            <p>3. Paste the key above</p>
          </div>
          <button onClick={() => { setRevealed(false); setPrivateKeyB58(null); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Hide private key
          </button>
        </div>
      )}
    </div>
  );
}

function ApiKeyTab({ wallet, signature }: { wallet: string; signature: Uint8Array | null }) {
  const [apiSig, setApiSig] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const generateKey = async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      const provider = w.phantom?.solana ?? w.solana ?? w.solflare;
      if (!provider) return;

      const authRes = await fetch("/api/auth");
      const { data } = await authRes.json();
      const message = new TextEncoder().encode(data.message);
      const { signature: sig } = await provider.signMessage(message, "utf8");
      const sigBase64 = btoa(String.fromCharCode(...sig));

      const verifyRes = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, signature: sigBase64 }),
      });
      const verify = await verifyRes.json();
      if (verify.data?.authenticated) {
        setApiSig(sigBase64);
        setVerified(true);
      }
    } catch {}
    setLoading(false);
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!wallet) {
    return (
      <div className="premium-card rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground">Connect your wallet (not manual address) to generate API credentials.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!verified ? (
        <div className="premium-card rounded-2xl p-8 text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">API Access</div>
          <p className="text-sm text-muted-foreground mb-6">
            Sign a message to generate your API credentials. No registration needed.
          </p>
          <button onClick={generateKey} disabled={loading} className="btn-gold px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-50">
            {loading ? "Signing..." : "Generate API Key"}
          </button>
        </div>
      ) : (
        <>
          <div className="premium-card rounded-2xl p-4 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-sage" />
            <span className="text-sm font-semibold">API Authenticated</span>
          </div>

          <div className="premium-card rounded-2xl p-5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">x-wallet</div>
            <div className="flex items-center gap-2">
              <code className="text-[11px] font-mono bg-muted px-3 py-2 rounded-lg flex-1 break-all">{wallet}</code>
              <button onClick={() => copy(wallet, "w")} className="btn-outline-luxury px-3 py-1.5 rounded-lg text-xs shrink-0">
                {copied === "w" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="premium-card rounded-2xl p-5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">x-signature</div>
            <div className="flex items-center gap-2">
              <code className="text-[11px] font-mono bg-muted px-3 py-2 rounded-lg flex-1 break-all max-h-16 overflow-auto">{apiSig}</code>
              <button onClick={() => copy(apiSig || "", "s")} className="btn-outline-luxury px-3 py-1.5 rounded-lg text-xs shrink-0">
                {copied === "s" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <button
            onClick={() => copy(
              `curl -X POST https://buff.finance/api/roundup -H "Content-Type: application/json" -H "x-wallet: ${wallet}" -H "x-signature: ${apiSig}" -d '{"txValueUsd":27.63,"plan":"tree"}'`,
              "curl"
            )}
            className="btn-outline-luxury w-full py-3 rounded-xl text-sm font-medium"
          >
            {copied === "curl" ? "Copied!" : "Copy as cURL"}
          </button>

          <p className="text-xs text-muted-foreground text-center">Never expires. Use on every API request.</p>
        </>
      )}
    </div>
  );
}

interface SolanaSignature {
  signature: string;
  blockTime: number | null;
  confirmationStatus: string | null;
  err: unknown;
  memo: string | null;
}

function relativeTime(unixSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unixSeconds;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(unixSeconds * 1000).toLocaleDateString();
}

function classifyTransaction(memo: string | null): string {
  if (!memo) return "Transaction";
  const lower = memo.toLowerCase();
  if (lower.includes("roundup") || lower.includes("round-up") || lower.includes("round up")) return "Round-Up Deposit";
  if (lower.includes("swap")) return "Swap";
  if (lower.includes("fee")) return "Fee";
  return "Transaction";
}

function ActivityTab({ buffWallet }: { buffWallet: string }) {
  const [transactions, setTransactions] = useState<SolanaSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const rpcUrl = "https://api.mainnet-beta.solana.com";
      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getSignaturesForAddress",
          params: [buffWallet, { limit: 20 }],
        }),
      });

      if (!res.ok) throw new Error(`RPC error: ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message || "RPC request failed");
      setTransactions(json.result ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [buffWallet]);

  return (
    <div className="premium-card rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border/30">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Recent Activity</div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading && transactions.length === 0 && (
        <div className="p-8 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-border/30" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-border/30 rounded w-1/3" />
                <div className="h-2 bg-border/20 rounded w-1/5" />
              </div>
              <div className="h-3 bg-border/30 rounded w-16" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.04] border border-red-500/15">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-red-400 shrink-0">
              <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-red-400">{error}</p>
              <button onClick={fetchTransactions} className="text-xs text-red-400/60 hover:text-red-400 mt-1 underline">
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <div className="text-center py-16 px-6">
          <div className="w-12 h-12 rounded-xl bg-secondary/50 border border-border/30 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground">
              <path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm text-muted-foreground mb-1">No transactions yet</div>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Transactions will appear here once round-ups start flowing into your Buff wallet.
          </p>
        </div>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div>
          {transactions.map((tx) => {
            const sig = tx.signature;
            const truncSig = `${sig.slice(0, 8)}...${sig.slice(-6)}`;
            const type = classifyTransaction(tx.memo);
            const failed = tx.err !== null;

            return (
              <div key={sig} className="flex items-center gap-4 px-6 py-4 border-b border-border/15 last:border-0 hover:bg-accent/50 transition-colors">
                {/* Icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  failed
                    ? "bg-red-500/[0.08] border border-red-500/20"
                    : type === "Round-Up Deposit"
                    ? "bg-sage/[0.12] border border-sage/25"
                    : type === "Swap"
                    ? "bg-gold/[0.1] border border-gold/20"
                    : "bg-secondary/50 border border-border/30"
                }`}>
                  {failed ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-400">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  ) : type === "Round-Up Deposit" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-sage">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  ) : type === "Swap" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gold">
                      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted-foreground">
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{type}</span>
                    {failed && (
                      <span className="text-[10px] font-medium text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">Failed</span>
                    )}
                    {!failed && tx.confirmationStatus === "finalized" && (
                      <span className="text-[10px] font-medium text-sage bg-sage/10 px-1.5 py-0.5 rounded">Confirmed</span>
                    )}
                  </div>
                  <a
                    href={`https://solscan.io/tx/${sig}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-muted-foreground hover:text-gold transition-colors"
                  >
                    {truncSig}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="inline ml-1 -mt-0.5">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-muted-foreground shrink-0 text-right">
                  {tx.blockTime ? relativeTime(tx.blockTime) : "Pending"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Allocation Picker ─────────────────────────────────────── */

const AVAILABLE_ASSETS = [
  { name: "BTC", color: "#F7931A" },
  { name: "ETH", color: "#627EEA" },
  { name: "SOL", color: "#9945FF" },
  { name: "USDC", color: "#2775CA" },
] as const;

const ASSET_COLOR_MAP: Record<string, string> = Object.fromEntries(
  AVAILABLE_ASSETS.map((a) => [a.name, a.color])
);

interface Allocation {
  asset: string;
  pct: number;
}

const PRESETS: { label: string; allocations: Allocation[] }[] = [
  { label: "All BTC", allocations: [{ asset: "BTC", pct: 100 }] },
  { label: "All ETH", allocations: [{ asset: "ETH", pct: 100 }] },
  {
    label: "Balanced",
    allocations: AVAILABLE_ASSETS.map((a) => ({
      asset: a.name,
      pct: Math.floor(100 / AVAILABLE_ASSETS.length),
    })).map((a, i, arr) => {
      // distribute remainder to last item so total = 100
      if (i === arr.length - 1) {
        const rest = arr.slice(0, -1).reduce((s, x) => s + x.pct, 0);
        return { ...a, pct: 100 - rest };
      }
      return a;
    }),
  },
];

function AllocationPicker({
  onChange,
}: {
  onChange: (allocations: Allocation[]) => void;
}) {
  const [allocations, setAllocations] = useState<Allocation[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("buff_allocations");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [{ asset: "BTC", pct: 100 }];
  });
  // draft values keyed by index — stores the text while the user is editing
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const total = allocations.reduce((s, a) => s + a.pct, 0);
  const isValid = total === 100;
  const usedAssets = new Set(allocations.map((a) => a.asset));
  const availableToAdd = AVAILABLE_ASSETS.filter((a) => !usedAssets.has(a.name));

  const update = (next: Allocation[]) => {
    setAllocations(next);
    onChange(next);
  };

  const applyPreset = (preset: Allocation[]) => {
    setDrafts({});
    update(preset);
  };

  const setPct = (index: number, pct: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(pct) ? 0 : pct));
    const next = allocations.map((a, i) => (i === index ? { ...a, pct: clamped } : a));
    update(next);
  };

  const removeAsset = (index: number) => {
    const next = allocations.filter((_, i) => i !== index);
    setDrafts({});
    update(next.length === 0 ? [{ asset: "BTC", pct: 100 }] : next);
  };

  const addAsset = (name: string) => {
    setDrafts({});
    update([...allocations, { asset: name, pct: 0 }]);
  };

  return (
    <div className="premium-card rounded-2xl p-6">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
        Investment Allocation
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.allocations)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Allocation bar */}
      <div className="flex rounded-full overflow-hidden h-3 gap-0.5 mb-4">
        {allocations.map((a, i) => (
          <div
            key={i}
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${total > 0 ? (a.pct / total) * 100 : 0}%`,
              backgroundColor: ASSET_COLOR_MAP[a.asset] || "#666",
              opacity: 0.75,
            }}
          />
        ))}
      </div>

      {/* Total indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">Total</span>
        <span
          className={`text-sm font-bold ${
            isValid ? "text-sage" : "text-red-400"
          }`}
        >
          {total}%{" "}
          {isValid ? (
            <span className="text-[10px] font-medium ml-1">Valid</span>
          ) : (
            <span className="text-[10px] font-medium ml-1">
              ({total < 100 ? `${100 - total}% remaining` : `${total - 100}% over`})
            </span>
          )}
        </span>
      </div>

      {/* Asset rows */}
      <div className="space-y-2 mb-4">
        {allocations.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20"
          >
            {/* Colored dot */}
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: ASSET_COLOR_MAP[a.asset] || "#666" }}
            />

            {/* Asset name */}
            <span className="text-sm font-semibold w-12">{a.asset}</span>

            {/* Percentage input — draft/commit on blur, no spinner */}
            <div className="flex-1">
              <input
                type="text"
                inputMode="numeric"
                className="w-full bg-muted border border-border/30 rounded-lg px-3 py-1.5 text-sm font-mono text-foreground text-right outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={drafts[i] !== undefined ? drafts[i] : String(a.pct)}
                onChange={(e) => {
                  // allow only digits in draft
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setDrafts((d) => ({ ...d, [i]: raw }));
                }}
                onBlur={() => {
                  if (drafts[i] !== undefined) {
                    setPct(i, parseInt(drafts[i], 10));
                    setDrafts((d) => {
                      const next = { ...d };
                      delete next[i];
                      return next;
                    });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">%</span>

            {/* Remove button */}
            <button
              onClick={() => removeAsset(i)}
              className="p-1 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
              aria-label={`Remove ${a.asset}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add asset */}
      {availableToAdd.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableToAdd.map((a) => (
            <button
              key={a.name}
              onClick={() => addAsset(a.name)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/50 transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {a.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const ASSET_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#9945FF",
  USDC: "#2775CA",
  USDT: "#26A17B",
};

export function PortfolioView({
  buffWallet,
  mainWallet,
  signature,
}: {
  buffWallet: string;
  mainWallet: string;
  signature: Uint8Array | null;
}) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [accumulator, setAccumulator] = useState<AccumulatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "assets" | "activity" | "api" | "settings">("overview");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [portRes, accRes] = await Promise.all([
        fetch(`/api/portfolio/${buffWallet}?network=mainnet-beta`),
        fetch(`/api/accumulator/${buffWallet}?threshold=5&network=mainnet-beta`),
      ]);

      const portData = await portRes.json();
      const accData = await accRes.json();

      if (portData.ok) setPortfolio(portData.data);
      if (accData.ok) setAccumulator(accData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [buffWallet]);

  if (loading && !portfolio) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="premium-card rounded-2xl h-48" />
        <div className="grid grid-cols-3 gap-4">
          <div className="premium-card rounded-xl h-32" />
          <div className="premium-card rounded-xl h-32" />
          <div className="premium-card rounded-xl h-32" />
        </div>
      </div>
    );
  }

  const totalValue = (portfolio?.totalUsd ?? 0) + (portfolio?.pendingUsd ?? 0);
  const progressPct = accumulator ? Math.min((accumulator.balanceUsd / accumulator.thresholdUsd) * 100, 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buff Wallet: <span className="font-mono text-foreground/80">{buffWallet.slice(0, 8)}...{buffWallet.slice(-6)}</span>
          </p>
          {mainWallet && (
            <p className="text-xs text-muted-foreground">
              Main: <span className="font-mono">{mainWallet.slice(0, 6)}...{mainWallet.slice(-4)}</span>
            </p>
          )}
        </div>
        <button onClick={fetchData} className="btn-outline-luxury px-4 py-2 rounded-lg text-sm font-medium">
          Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 border border-border/30 w-fit">
        {(["overview", "assets", "activity", "api", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === t ? "bg-gold/10 text-gold border border-gold/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* Total Value Card */}
          <div className="premium-card rounded-2xl p-8">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Portfolio Value</div>
            <div className="text-5xl font-extrabold text-gold number-glow tracking-tight">
              ${totalValue.toFixed(2)}
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="text-muted-foreground">
                SOL Price: <span className="text-foreground font-medium">${portfolio?.solPriceUsd?.toFixed(2)}</span>
              </span>
              <a
                href={`https://changelly.com/buy/sol?to=${buffWallet}`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold/10 text-gold text-xs font-semibold border border-gold/20 hover:bg-gold/15 hover:shadow-md transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                Buy SOL
              </a>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Invested Assets */}
            <div className="premium-card rounded-xl p-6">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Invested Assets</div>
              <div className="text-2xl font-bold">${(portfolio?.totalUsd ?? 0).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {portfolio?.balances?.length ?? 0} tokens
              </div>
            </div>

            {/* Pending (Accumulating) */}
            <div className="premium-card rounded-xl p-6">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Pending Round-Ups</div>
              <div className="text-2xl font-bold">{accumulator?.balanceSol?.toFixed(6) ?? "0"} SOL</div>
              <div className="text-xs text-muted-foreground mt-1">
                ${accumulator?.balanceUsd?.toFixed(2) ?? "0.00"} USD
              </div>
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Next swap at ${accumulator?.thresholdUsd ?? 5}</span>
                  <span>{progressPct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gold/60 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>

            {/* Buff Fees Paid */}
            <div className="premium-card rounded-xl p-6">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Status</div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${accumulator?.thresholdReached ? "bg-gold animate-pulse" : "bg-sage"}`} />
                <span className="text-sm font-semibold">
                  {accumulator?.thresholdReached ? "Ready to swap!" : "Accumulating"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {accumulator?.thresholdReached
                  ? "Threshold reached — next tx will trigger a swap"
                  : `$${accumulator?.remaining?.toFixed(2) ?? "0"} more to go`}
              </div>
            </div>
          </div>

          {/* Allocation */}
          {portfolio && portfolio.balances.length > 0 && (
            <div className="premium-card rounded-2xl p-6">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Portfolio Allocation</div>
              {/* Bar */}
              <div className="flex rounded-full overflow-hidden h-3 gap-0.5 mb-4">
                {portfolio.balances.map((b) => (
                  <div
                    key={b.asset}
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${portfolio.totalUsd > 0 ? (b.usdValue / portfolio.totalUsd) * 100 : 0}%`,
                      backgroundColor: ASSET_COLORS[b.asset] || "#666",
                      opacity: 0.75,
                    }}
                  />
                ))}
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {portfolio.balances.map((b) => (
                  <div key={b.asset} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ASSET_COLORS[b.asset] || "#666" }} />
                    <div>
                      <div className="text-sm font-semibold">{b.asset}</div>
                      <div className="text-xs text-muted-foreground">${b.usdValue.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "assets" && (
        <div className="premium-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Asset Details</div>
          </div>

          {/* Pending SOL */}
          <div className="flex items-center justify-between p-5 border-b border-border/20 hover:bg-accent transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#9945FF15", border: "1px solid #9945FF30" }}>
                <span className="text-sm font-bold" style={{ color: "#9945FF" }}>SOL</span>
              </div>
              <div>
                <div className="text-sm font-bold">Pending SOL</div>
                <div className="text-xs text-muted-foreground">Accumulating for next swap</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{portfolio?.pendingSol?.toFixed(6) ?? "0"} SOL</div>
              <div className="text-xs text-muted-foreground">${portfolio?.pendingUsd?.toFixed(2) ?? "0.00"}</div>
            </div>
          </div>

          {/* Token balances */}
          {portfolio?.balances?.map((b) => (
            <div key={b.asset} className="flex items-center justify-between p-5 border-b border-border/20 last:border-0 hover:bg-accent transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (ASSET_COLORS[b.asset] || "#666") + "15", border: `1px solid ${ASSET_COLORS[b.asset] || "#666"}30` }}>
                  <span className="text-sm font-bold" style={{ color: ASSET_COLORS[b.asset] }}>{b.asset}</span>
                </div>
                <div>
                  <div className="text-sm font-bold">{b.asset}</div>
                  <div className="text-xs text-muted-foreground font-mono">{b.mint.slice(0, 8)}...{b.mint.slice(-4)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{b.balance}</div>
                <div className="text-xs text-muted-foreground">${b.usdValue.toFixed(2)}</div>
              </div>
            </div>
          ))}

          {(!portfolio?.balances || portfolio.balances.length === 0) && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No invested assets yet. Round-ups will appear here after your first swap.
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <ActivityTab buffWallet={buffWallet} />
      )}

      {activeTab === "api" && (
        <ApiKeyTab wallet={mainWallet} signature={signature} />
      )}

      {activeTab === "settings" && (
        <div className="space-y-4">
          <AllocationPicker
            onChange={(allocs) => {
              localStorage.setItem("buff_allocations", JSON.stringify(allocs));
            }}
          />

          <div className="premium-card rounded-2xl p-6">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Wallet Info</div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Buff Wallet Address</div>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-secondary/50 px-3 py-2 rounded-lg flex-1 break-all">{buffWallet}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(buffWallet)}
                    className="btn-outline-luxury px-3 py-2 rounded-lg text-xs font-medium shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
              {mainWallet && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Main Wallet</div>
                  <code className="text-sm font-mono bg-secondary/50 px-3 py-2 rounded-lg block break-all">{mainWallet}</code>
                </div>
              )}
            </div>
          </div>

          <ExportSection signature={signature} />

          <div className="premium-card rounded-2xl p-6">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Connected Platforms</div>
            <p className="text-sm text-muted-foreground mb-4">
              Any platform using the Buff SDK or API that your wallet has interacted with will appear here. Your Buff wallet is the same across all platforms.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-sage/[0.06] border border-sage/20">
                <span className="w-2.5 h-2.5 rounded-full bg-sage shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">Buff Dashboard</div>
                  <div className="text-xs text-muted-foreground">Connected via web wallet</div>
                </div>
                <span className="text-[10px] font-medium text-sage bg-sage/10 px-2 py-0.5 rounded">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
          {error}
        </div>
      )}
    </div>
  );
}
