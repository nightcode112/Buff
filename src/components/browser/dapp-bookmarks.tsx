"use client";

interface DAppBookmark {
  name: string;
  url: string;
  category: string;
  color: string;
  letter: string;
}

const BOOKMARKS: DAppBookmark[] = [
  { name: "Jupiter", url: "https://jup.ag", category: "Swaps", color: "#22d3ee", letter: "J" },
  { name: "Raydium", url: "https://raydium.io/swap", category: "Swaps & LP", color: "#6366f1", letter: "R" },
  { name: "Meteora", url: "https://meteora.ag", category: "LP & Pools", color: "#8b5cf6", letter: "M" },
  { name: "Orca", url: "https://orca.so", category: "Swaps", color: "#f59e0b", letter: "O" },
  { name: "marginfi", url: "https://marginfi.com", category: "Lending", color: "#64748b", letter: "m" },
];

interface DAppBookmarksProps {
  onNavigate: (url: string) => void;
}

export function DAppBookmarks({ onNavigate }: DAppBookmarksProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gold">
            <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="currentColor" opacity="0.3" />
            <path d="M12 14V22M12 14C9.79 14 8 12.21 8 10M12 14C14.21 14 16 12.21 16 10M8 18H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold mb-2">Buff dApp Browser</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Browse Solana dApps with automatic round-ups. Every swap, trade, and mint gets rounded up to grow your portfolio.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-2xl w-full">
        {BOOKMARKS.map((dapp) => (
          <button
            key={dapp.name}
            onClick={() => onNavigate(dapp.url)}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary/60 transition-all duration-200"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-110 transition-transform"
              style={{ backgroundColor: dapp.color }}
            >
              {dapp.letter}
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-foreground truncate max-w-[80px]">{dapp.name}</div>
              <div className="text-[10px] text-muted-foreground">{dapp.category}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
