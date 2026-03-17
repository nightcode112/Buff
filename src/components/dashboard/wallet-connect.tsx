"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { getAppKit } from "@/lib/reown";

interface WalletConnectProps {
  onConnect: (buffWallet: string, mainWallet: string, signature: Uint8Array | null) => void;
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const [error, setError] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [agentAddress, setAgentAddress] = useState("");
  const [mode, setMode] = useState<"connect" | "manual" | "agent">("connect");
  const [signing, setSigning] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const pendingSign = useRef(false);

  // Init AppKit + check if already connected
  useEffect(() => {
    const appKit = getAppKit();
    if (appKit) {
      const addr = appKit.getAddress();
      if (addr) setConnectedAddress(addr);
    }
  }, []);

  const signAndDerive = useCallback(async (address: string) => {
    if (pendingSign.current) return;
    pendingSign.current = true;
    setSigning(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      const provider = w.phantom?.solana ?? w.solana ?? w.solflare;

      if (!provider) {
        setError("Wallet connected but no signing provider found.");
        setSigning(false);
        pendingSign.current = false;
        return;
      }

      const message = new TextEncoder().encode("Buff Portfolio Wallet v1");
      const { signature } = await provider.signMessage(message, "utf8");
      const sigBytes = new Uint8Array(signature);

      const sigBase64 = btoa(String.fromCharCode(...sigBytes));
      const res = await fetch("/api/wallet/derive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: sigBase64 }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      onConnect(data.data.publicKey, address, sigBytes);
    } catch (err) {
      if (err instanceof Error && err.message.includes("User rejected")) {
        // User cancelled signing — just reset, don't show error
      } else {
        setError(err instanceof Error ? err.message : "Failed to sign");
      }
    }
    setSigning(false);
    pendingSign.current = false;
  }, [onConnect]);

  const handleConnect = () => {
    // If already connected, just sign
    if (connectedAddress) {
      signAndDerive(connectedAddress);
      return;
    }

    const appKit = getAppKit();
    if (!appKit) return;

    appKit.open();

    // Listen for connection — poll but stop when modal closes
    let stopped = false;
    const interval = setInterval(() => {
      if (stopped) return;

      const addr = appKit.getAddress();
      if (addr) {
        stopped = true;
        clearInterval(interval);
        setConnectedAddress(addr);
        signAndDerive(addr);
      }

      // Check if modal was closed without connecting
      const state = appKit.getState();
      if (!state.open && !addr) {
        stopped = true;
        clearInterval(interval);
      }
    }, 500);

    // Safety: stop after 60s
    setTimeout(() => {
      if (!stopped) {
        stopped = true;
        clearInterval(interval);
      }
    }, 60000);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="premium-card rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gold">
            <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="currentColor" opacity="0.3" />
            <path d="M12 14V22M12 14C9.79 14 8 12.21 8 10M12 14C14.21 14 16 12.21 16 10M8 18H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold mb-2">Buff Dashboard</h2>
        <p className="text-sm text-muted-foreground mb-8">Connect your wallet to view your portfolio and export your Buff wallet.</p>

        <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 border border-border/30 mb-6">
          <button onClick={() => setMode("connect")} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "connect" ? "bg-gold/10 text-gold" : "text-muted-foreground"}`}>
            Connect Wallet
          </button>
          <button onClick={() => setMode("manual")} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "manual" ? "bg-gold/10 text-gold" : "text-muted-foreground"}`}>
            View by Address
          </button>
          <button onClick={() => setMode("agent")} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "agent" ? "bg-gold/10 text-gold" : "text-muted-foreground"}`}>
            Monitor
          </button>
        </div>

        {mode === "connect" ? (
          connectedAddress ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground mb-2">
                <span className="w-2 h-2 rounded-full bg-sage" />
                <span className="font-mono text-xs">{connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}</span>
                <span>connected</span>
              </div>
              <button
                onClick={handleConnect}
                disabled={signing}
                className="btn-gold w-full py-4 rounded-xl text-base font-bold disabled:opacity-50"
              >
                {signing ? "Signing..." : "Sign to continue"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={signing}
              className="btn-gold w-full py-4 rounded-xl text-base font-bold disabled:opacity-50"
            >
              {signing ? "Signing..." : "Connect Wallet"}
            </button>
          )
        ) : mode === "manual" ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Buff wallet address"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              className="w-full bg-secondary/40 border border-border/30 rounded-xl px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:border-gold/30"
            />
            <button
              onClick={() => { if (manualAddress.length >= 32) onConnect(manualAddress, "", null); }}
              disabled={manualAddress.length < 32}
              className="btn-gold w-full py-4 rounded-xl text-base font-bold disabled:opacity-50"
            >
              View Portfolio
            </button>
            <p className="text-xs text-muted-foreground">Read-only — export requires wallet connection</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              <span>AI Agent read-only monitoring</span>
            </div>
            <input
              type="text"
              placeholder="Agent public key"
              value={agentAddress}
              onChange={(e) => setAgentAddress(e.target.value)}
              className="w-full bg-secondary/40 border border-border/30 rounded-xl px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:border-gold/30"
            />
            <button
              onClick={() => { if (agentAddress.length >= 32) onConnect(agentAddress, "", null); }}
              disabled={agentAddress.length < 32}
              className="btn-gold w-full py-4 rounded-xl text-base font-bold disabled:opacity-50"
            >
              View Agent Portfolio
            </button>
            <p className="text-xs text-muted-foreground">Read-only — no wallet signature required for agent monitoring</p>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">{error}</div>
        )}

        <div className="mt-6 pt-6 border-t border-border/20">
          <p className="text-sm text-muted-foreground">
            No wallet?{" "}
            <Link href="/dashboard/signup" className="text-gold hover:text-gold/80 font-semibold transition-colors">
              Sign up with email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
