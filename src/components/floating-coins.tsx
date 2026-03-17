"use client";

export function FloatingCoins() {
  const coins = [
    { top: "12%", left: "8%", delay: "0s", size: 6, opacity: 0.15 },
    { top: "20%", right: "12%", delay: "2s", size: 8, opacity: 0.1 },
    { top: "60%", left: "5%", delay: "4s", size: 5, opacity: 0.12 },
    { top: "75%", right: "8%", delay: "1s", size: 7, opacity: 0.08 },
    { top: "40%", left: "15%", delay: "3s", size: 4, opacity: 0.18 },
    { top: "85%", left: "20%", delay: "5s", size: 6, opacity: 0.1 },
    { top: "30%", right: "20%", delay: "2.5s", size: 5, opacity: 0.14 },
    { top: "55%", right: "15%", delay: "4.5s", size: 4, opacity: 0.12 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {coins.map((coin, i) => (
        <div
          key={i}
          className="absolute animate-float-slow"
          style={{
            top: coin.top,
            left: coin.left,
            right: coin.right,
            animationDelay: coin.delay,
            animationDuration: `${6 + i * 0.8}s`,
          }}
        >
          {/* Coin */}
          <div
            className="rounded-full bg-gradient-to-br from-gold/30 to-gold-dark/20 border border-gold/20"
            style={{
              width: `${coin.size * 4}px`,
              height: `${coin.size * 4}px`,
              opacity: coin.opacity,
              boxShadow: `0 0 ${coin.size * 4}px rgba(59, 130, 246, 0.1)`,
            }}
          >
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <span
                className="text-gold font-bold"
                style={{ fontSize: `${coin.size * 1.5}px` }}
              >
                $
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
