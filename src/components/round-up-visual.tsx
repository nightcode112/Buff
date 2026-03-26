"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";

function OdometerDigit({ digit }: { digit: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isNumber = /\d/.test(digit);

  useEffect(() => {
    if (!isNumber || !ref.current) return;
    gsap.to(ref.current, {
      y: `${-Number(digit)}em`,
      duration: 0.6,
      ease: "power3.out",
    });
  }, [digit, isNumber]);

  if (!isNumber) {
    return <span>{digit}</span>;
  }

  return (
    <span className="inline-block overflow-hidden relative" style={{ width: "0.6em", height: "1em" }}>
      <span ref={ref} className="inline-flex flex-col absolute left-0">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="block h-[1em] leading-none">{n}</span>
        ))}
      </span>
    </span>
  );
}

function Odometer({ value, className }: { value: string; className?: string }) {
  const chars = value.split("");
  return (
    <span className={`inline-flex ${className}`}>
      {chars.map((char, i) => (
        <OdometerDigit key={`${i}-${chars.length}`} digit={char} />
      ))}
    </span>
  );
}

const transactions = [
  { label: "Swap SOL → USDC", fee: "$0.42", roundUp: "$0.58", chain: "Solana", asset: "BTC" },
  { label: "Mint NFT", fee: "$0.23", roundUp: "$0.77", chain: "Solana", asset: "BTC" },
  { label: "Stake SOL", fee: "$0.11", roundUp: "$0.89", chain: "Solana", asset: "SOL" },
  { label: "Jupiter Swap", fee: "$0.67", roundUp: "$0.33", chain: "Solana", asset: "BTC" },
];

const portfolio = [
  { asset: "ETH", allocation: 40, color: "#627EEA" },
  { asset: "BTC", allocation: 30, color: "#F7931A" },
  { asset: "SOL", allocation: 20, color: "#9945FF" },
  { asset: "USDC", allocation: 10, color: "#2775CA" },
];

let nextId = 1;

export function RoundUpVisual() {
  const [history, setHistory] = useState<{ id: number; txIdx: number }[]>([
    { id: -3, txIdx: 0 },
    { id: -2, txIdx: 3 },
    { id: -1, txIdx: 2 },
    { id: 0, txIdx: 1 },
  ]);
  const [invested, setInvested] = useState(127.43);
  const counterRef = useRef(0);

  const tick = useCallback(() => {
    counterRef.current = (counterRef.current + 1) % transactions.length;
    const txIdx = counterRef.current;
    const amount = parseFloat(transactions[txIdx].roundUp.replace("$", ""));

    setHistory((prev) => [{ id: nextId++, txIdx }, ...prev].slice(0, transactions.length));
    setInvested((s) => s + amount);
  }, []);

  useEffect(() => {
    const interval = setInterval(tick, 3000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="relative w-full min-w-[320px] max-w-[520px] lg:min-w-[500px] lg:max-w-[640px] xl:max-w-[720px]">
      {/* Portfolio card */}
      <div className="bg-[#000000] border border-[#ffffff08] rounded-none overflow-hidden relative mb-3 lg:mb-4">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffffff20] to-transparent" />

        <div className="px-4 pt-6 pb-4 lg:px-8 lg:pt-10 lg:pb-8">
          <div className="text-[10px] text-[#555] uppercase tracking-[0.3em] font-medium mb-2 lg:mb-4">Portfolio</div>
          <div className="flex items-baseline gap-2 lg:gap-3">
            <div className="text-3xl lg:text-5xl font-bold text-white tabular-nums tracking-tighter leading-none font-sans">
              <Odometer value={`$${invested.toFixed(2)}`} />
            </div>
            <span className="text-xs lg:text-sm text-[#00ffaa] font-medium tracking-wide">+12.4%</span>
          </div>
        </div>

        {/* Allocation bar */}
        <div className="px-4 pb-4 lg:px-8 lg:pb-6">
          <div className="flex overflow-hidden h-1 gap-[2px]">
            {portfolio.map((p) => (
              <div key={p.asset} className="h-full" style={{ width: `${p.allocation}%`, backgroundColor: p.color, opacity: 0.8 }} />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-4">
            {portfolio.map((p, i) => (
              <div key={p.asset} className={`text-center cursor-default py-1 ${i > 0 ? "border-l border-[#ffffff08]" : ""}`}>
                <div className="text-[10px] text-[#555] uppercase tracking-wider">{p.asset}</div>
                <div className="text-xs lg:text-sm font-bold tabular-nums" style={{ color: p.color }}>{p.allocation}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction feed — separate cards, newest on top */}
      <div className="space-y-1.5 lg:space-y-2 overflow-hidden">
        {history.map((entry, i) => {
          const tx = transactions[entry.txIdx];
          const isTop = i === 0;
          return (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: -48 }}
              animate={{ opacity: isTop ? 1 : 0.3, y: 0 }}
              transition={{
                layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.4 },
                y: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
              }}
              className={`bg-[#000000] border rounded-none p-3 lg:p-4 ${
                isTop ? "border-[#ffffff10]" : "border-[#ffffff06]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs lg:text-sm font-medium text-white truncate">{tx.label}</div>
                  <div className="text-[10px] lg:text-[11px] text-[#444]">{tx.fee} → $1.00</div>
                </div>
                <div className={`text-sm lg:text-base font-bold tabular-nums shrink-0 ml-3 ${isTop ? "text-[#00ffaa]" : "text-[#333]"}`}>
                  +{tx.roundUp}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
