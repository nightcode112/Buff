"use client";

import { useState, useRef, useEffect } from "react";

interface BrowserChromeProps {
  url: string;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  loading: boolean;
  buffEnabled: boolean;
  onToggleBuff: () => void;
}

export function BrowserChrome({
  url,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  canGoBack,
  canGoForward,
  loading,
  buffEnabled,
  onToggleBuff,
}: BrowserChromeProps) {
  const [inputValue, setInputValue] = useState(url);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(url);
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let navigateUrl = inputValue.trim();
    if (!navigateUrl) return;

    // Add https:// if no protocol
    if (!navigateUrl.startsWith("http://") && !navigateUrl.startsWith("https://")) {
      navigateUrl = "https://" + navigateUrl;
    }

    onNavigate(navigateUrl);
    inputRef.current?.blur();
  };

  const displayDomain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/40 border-b border-border/30 rounded-t-xl">
      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="p-1.5 rounded-lg hover:bg-secondary/60 disabled:opacity-30 transition-colors"
          title="Back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={onForward}
          disabled={!canGoForward}
          className="p-1.5 rounded-lg hover:bg-secondary/60 disabled:opacity-30 transition-colors"
          title="Forward"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors"
          title="Refresh"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={loading ? "animate-spin" : ""}>
            <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>
      </div>

      {/* URL bar */}
      <form onSubmit={handleSubmit} className="flex-1">
        <div className="relative">
          {loading && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-gold animate-pulse rounded-full" style={{ width: "60%" }} />
          )}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search or enter dApp URL..."
            className="w-full bg-background/60 border border-border/30 rounded-lg px-4 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all"
            onFocus={(e) => e.target.select()}
          />
          {displayDomain && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              {displayDomain}
            </div>
          )}
        </div>
      </form>

      {/* Buff toggle */}
      <button
        onClick={onToggleBuff}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          buffEnabled
            ? "bg-gold/10 text-gold border border-gold/20"
            : "bg-secondary/60 text-muted-foreground border border-border/30"
        }`}
        title={buffEnabled ? "Round-ups enabled" : "Round-ups disabled"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={buffEnabled ? "text-gold" : "text-muted-foreground"}>
          <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="currentColor" opacity="0.3" />
          <path d="M12 14V22M12 14C9.79 14 8 12.21 8 10M12 14C14.21 14 16 12.21 16 10M8 18H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {buffEnabled ? "Buff ON" : "Buff OFF"}
      </button>
    </div>
  );
}
