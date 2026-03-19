"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { BrowserChrome } from "@/components/browser/browser-chrome";
import { WalletBridge } from "@/components/browser/wallet-bridge";
import { DAppBookmarks } from "@/components/browser/dapp-bookmarks";

export default function BrowsePage() {
  // Auth state
  const [mainWallet, setMainWallet] = useState<string | null>(null);
  const [buffWallet, setBuffWallet] = useState<string | null>(null);
  const [signature, setSignature] = useState<Uint8Array | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Browser state
  const [currentUrl, setCurrentUrl] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [buffEnabled, setBuffEnabled] = useState(true);
  const [roundUpToast, setRoundUpToast] = useState<number | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check for existing web2 login
  useEffect(() => {
    try {
      const email = localStorage.getItem("buff_web2_email");
      const pubkey = localStorage.getItem("buff_web2_pubkey");
      if (email && pubkey) {
        setBuffWallet(pubkey);
        setMainWallet(pubkey);
        setAuthenticated(true);
      }
    } catch {}
  }, []);

  // Direct Phantom connect (no Reown AppKit — avoids portfolio popup)
  const handleConnect = useCallback(async () => {
    setConnecting(true);
    setAuthError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      const provider = w.phantom?.solana ?? w.solana ?? w.solflare;

      if (!provider) {
        setAuthError("No Solana wallet found. Please install Phantom.");
        setConnecting(false);
        return;
      }

      // Connect
      const resp = await provider.connect();
      const pubkey = resp.publicKey.toBase58();

      // Sign to derive buff wallet
      const message = new TextEncoder().encode("Buff Portfolio Wallet v1");
      const { signature: sigBytes } = await provider.signMessage(message, "utf8");
      const sig = new Uint8Array(sigBytes);

      const sigBase64 = btoa(String.fromCharCode(...sig));
      const res = await fetch("/api/wallet/derive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: sigBase64 }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      setBuffWallet(data.data.publicKey);
      setMainWallet(pubkey);
      setSignature(sig);
      setAuthenticated(true);
    } catch (err) {
      if (err instanceof Error && err.message.includes("User rejected")) {
        // User cancelled — just reset
      } else {
        setAuthError(err instanceof Error ? err.message : "Connection failed");
      }
    }
    setConnecting(false);
  }, []);

  const navigateTo = useCallback(
    (url: string) => {
      if (!url) return;
      const newHistory = [...history.slice(0, historyIndex + 1), url];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentUrl(url);
      setLoading(true);
    },
    [history, historyIndex]
  );

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setLoading(true);
    }
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setLoading(true);
    }
  }, [history, historyIndex]);

  const goHome = useCallback(() => {
    setCurrentUrl("");
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    if (iframeRef.current && currentUrl) {
      setLoading(true);
      const src = iframeRef.current.src;
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = src;
      }, 50);
    }
  }, [currentUrl]);

  const proxyUrl = currentUrl
    ? `/api/proxy?url=${encodeURIComponent(currentUrl)}`
    : "";

  const handleRoundUp = useCallback((amount: number) => {
    setRoundUpToast(amount);
    setTimeout(() => setRoundUpToast(null), 3000);
  }, []);

  // Not authenticated — show direct wallet connect
  if (!authenticated) {
    return (
      <main className="min-h-screen pt-[88px] pb-16 px-6 flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="premium-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gold">
                <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="currentColor" opacity="0.3" />
                <path d="M12 14V22M12 14C9.79 14 8 12.21 8 10M12 14C14.21 14 16 12.21 16 10M8 18H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold mb-2">Buff dApp Browser</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Connect your wallet to browse Solana dApps with automatic round-ups
            </p>

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="btn-gold w-full py-4 rounded-xl text-base font-bold disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>

            {authError && (
              <div className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {authError}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-[80px] pb-4 px-4 flex flex-col">
      {/* Round-up toast */}
      {roundUpToast !== null && (
        <div className="fixed top-20 right-6 z-50 animate-fade-up">
          <div className="bg-sage/10 border border-sage/20 text-sage rounded-xl px-5 py-3 text-sm font-semibold shadow-lg flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-sage">
              <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="currentColor" opacity="0.3" />
              <path d="M12 14V22M8 18H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Rounded up ${roundUpToast.toFixed(2)}
          </div>
        </div>
      )}

      {/* Browser frame */}
      <div className="flex-1 flex flex-col max-w-[1400px] w-full mx-auto">
        <BrowserChrome
          url={currentUrl}
          onNavigate={navigateTo}
          onBack={goBack}
          onForward={goForward}
          onRefresh={refresh}
          onHome={goHome}
          canGoBack={historyIndex > 0}
          canGoForward={historyIndex < history.length - 1}
          loading={loading}
          buffEnabled={buffEnabled}
          onToggleBuff={() => setBuffEnabled((e) => !e)}
        />

        {/* Content area */}
        <div className="flex-1 bg-background border-x border-border/30 min-h-[calc(100vh-200px)] relative">
          {currentUrl ? (
            <iframe
              ref={iframeRef}
              src={proxyUrl}
              className="w-full h-full absolute inset-0 border-0"
              style={{ minHeight: "calc(100vh - 200px)" }}
              onLoad={() => setLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation"
              title="dApp Browser"
            />
          ) : (
            <DAppBookmarks onNavigate={navigateTo} />
          )}
        </div>

        <WalletBridge
          iframeRef={iframeRef}
          mainWallet={mainWallet}
          buffWallet={buffWallet}
          signature={signature}
          buffEnabled={buffEnabled}
          onRoundUp={handleRoundUp}
        />
      </div>
    </main>
  );
}
