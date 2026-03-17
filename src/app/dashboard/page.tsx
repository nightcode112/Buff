"use client";

import { useState, useEffect } from "react";
import { WalletConnect } from "@/components/dashboard/wallet-connect";
import { PortfolioView } from "@/components/dashboard/portfolio-view";
import Link from "next/link";

export default function DashboardPage() {
  const [connected, setConnected] = useState(false);
  const [buffWallet, setBuffWallet] = useState("");
  const [mainWallet, setMainWallet] = useState("");
  const [signature, setSignature] = useState<Uint8Array | null>(null);
  const [web2Email, setWeb2Email] = useState<string | null>(null);
  const [checkingLocalStorage, setCheckingLocalStorage] = useState(true);

  // On mount, check if there's a web2 login in localStorage
  useEffect(() => {
    const email = localStorage.getItem("buff_web2_email");
    const pubkey = localStorage.getItem("buff_web2_pubkey");

    if (email && pubkey) {
      setWeb2Email(email);
      setBuffWallet(pubkey);
      setMainWallet("");
      setSignature(null);
      setConnected(true);
    }
    setCheckingLocalStorage(false);
  }, []);

  const handleConnect = (buff: string, main: string, sig: Uint8Array | null) => {
    setBuffWallet(buff);
    setMainWallet(main);
    setSignature(sig);
    setConnected(true);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setBuffWallet("");
    setMainWallet("");
    setSignature(null);
    setWeb2Email(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("buff_web2_wallet");
    localStorage.removeItem("buff_web2_email");
    localStorage.removeItem("buff_web2_pubkey");
    handleDisconnect();
  };

  // Don't render until we've checked localStorage to avoid flash
  if (checkingLocalStorage) {
    return (
      <div className="min-h-screen pt-[72px]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <div className="premium-card rounded-2xl h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {!connected ? (
          <WalletConnect onConnect={handleConnect} />
        ) : (
          <>
            <div className="flex items-center justify-end gap-3 mb-6">
              {web2Email && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                  <span className="font-mono text-xs">{web2Email}</span>
                </span>
              )}
              {web2Email ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/5 hover:border-red-500/30 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Log out
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/5 hover:border-red-500/30 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Disconnect
                </button>
              )}
            </div>
            <PortfolioView buffWallet={buffWallet} mainWallet={mainWallet} signature={signature} />
          </>
        )}
      </div>
    </div>
  );
}
