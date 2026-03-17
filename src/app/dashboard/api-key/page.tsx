"use client";

import { useState } from "react";

export default function ApiKeyPage() {
  const [wallet, setWallet] = useState("");
  const [signature, setSignature] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const connect = async () => {
    setConnecting(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      const provider = w.phantom?.solana ?? w.solana ?? w.solflare;
      if (!provider) {
        setError("No Solana wallet found. Install Phantom or Solflare.");
        setConnecting(false);
        return;
      }

      const resp = await provider.connect();
      const pubkey = resp.publicKey.toBase58();
      setWallet(pubkey);

      // Get auth message from API
      const authRes = await fetch("/api/auth");
      const { data } = await authRes.json();

      // Sign it
      const message = new TextEncoder().encode(data.message);
      const { signature: sig } = await provider.signMessage(message, "utf8");
      const sigBase64 = btoa(String.fromCharCode(...sig));
      setSignature(sigBase64);

      // Verify
      const verifyRes = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: pubkey, signature: sigBase64 }),
      });
      const verify = await verifyRes.json();
      setVerified(verify.data?.authenticated === true);

      if (!verify.data?.authenticated) {
        setError("Signature verification failed. Try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
    setConnecting(false);
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-extrabold mb-2">API Access</h1>
        <p className="text-muted-foreground mb-8">
          Connect your wallet to get your API credentials. No registration needed — your wallet is your identity.
        </p>

        {!verified ? (
          <div className="premium-card rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Sign a one-time message to generate your API credentials.
            </p>
            <button
              onClick={connect}
              disabled={connecting}
              className="btn-gold px-8 py-3 rounded-xl text-base font-bold disabled:opacity-50"
            >
              {connecting ? "Signing..." : "Connect & Sign"}
            </button>
            {error && (
              <div className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">{error}</div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="premium-card rounded-2xl p-5 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-sage" />
              <span className="text-sm font-semibold">Authenticated</span>
            </div>

            {/* Wallet */}
            <div className="premium-card rounded-2xl p-5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Your Wallet (x-wallet header)</div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-muted px-3 py-2 rounded-lg flex-1 break-all">{wallet}</code>
                <button onClick={() => copy(wallet, "wallet")} className="btn-outline-luxury px-3 py-2 rounded-lg text-xs font-medium shrink-0">
                  {copied === "wallet" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Signature */}
            <div className="premium-card rounded-2xl p-5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Your Signature (x-signature header)</div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-muted px-3 py-2 rounded-lg flex-1 break-all max-h-20 overflow-auto">{signature}</code>
                <button onClick={() => copy(signature, "sig")} className="btn-outline-luxury px-3 py-2 rounded-lg text-xs font-medium shrink-0">
                  {copied === "sig" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Usage example */}
            <div className="premium-card rounded-2xl p-5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Usage</div>
              <div className="code-block rounded-xl p-4 text-[12px] font-mono text-slate-300 leading-6 overflow-x-auto">
                <div><span style={{color:"#64748b"}}>// Add these headers to any protected endpoint</span></div>
                <div><span style={{color:"#93c5fd"}}>fetch</span>(<span style={{color:"#fbbf24"}}>{'"'}https://buff.finance/api/roundup{'"'}</span>, {"{"}</div>
                <div>  <span style={{color:"#e2e8f0"}}>method</span>: <span style={{color:"#fbbf24"}}>{'"'}POST{'"'}</span>,</div>
                <div>  <span style={{color:"#e2e8f0"}}>headers</span>: {"{"}</div>
                <div>    <span style={{color:"#fbbf24"}}>{'"'}Content-Type{'"'}</span>: <span style={{color:"#fbbf24"}}>{'"'}application/json{'"'}</span>,</div>
                <div>    <span style={{color:"#fbbf24"}}>{'"'}x-wallet{'"'}</span>: <span style={{color:"#fbbf24"}}>{'"'}{wallet.slice(0, 8)}...{'"'}</span>,</div>
                <div>    <span style={{color:"#fbbf24"}}>{'"'}x-signature{'"'}</span>: <span style={{color:"#fbbf24"}}>{'"'}{signature.slice(0, 12)}...{'"'}</span>,</div>
                <div>  {"}"},</div>
                <div>  <span style={{color:"#e2e8f0"}}>body</span>: <span style={{color:"#93c5fd"}}>JSON</span>.<span style={{color:"#34d399"}}>stringify</span>({"{"} <span style={{color:"#e2e8f0"}}>txValueUsd</span>: <span style={{color:"#f59e0b"}}>27.63</span>, <span style={{color:"#e2e8f0"}}>plan</span>: <span style={{color:"#fbbf24"}}>{'"'}tree{'"'}</span> {"}"})</div>
                <div>{"}"})</div>
              </div>
            </div>

            {/* Copy full curl */}
            <button
              onClick={() => copy(
                `curl -X POST https://buff.finance/api/roundup -H "Content-Type: application/json" -H "x-wallet: ${wallet}" -H "x-signature: ${signature}" -d '{"txValueUsd": 27.63, "plan": "tree"}'`,
                "curl"
              )}
              className="btn-outline-luxury w-full py-3 rounded-xl text-sm font-medium"
            >
              {copied === "curl" ? "Copied!" : "Copy as cURL command"}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              This signature never expires. Use the same wallet + signature on every request.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
