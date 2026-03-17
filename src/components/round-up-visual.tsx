"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chainIcons } from "@/components/chain-icons";

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

export function RoundUpVisual() {
  const [active, setActive] = useState(0);
  const [invested, setInvested] = useState(127.43);
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % transactions.length;
        setInvested((s) => s + parseFloat(transactions[next].roundUp.replace("$", "")));
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Portfolio card */}
      <motion.div
        className="glass shine-on-hover rounded-2xl p-6 mb-4 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
              <span className="text-gold text-xs font-bold">$</span>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-medium">Buff Portfolio</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={active}
              className="text-xs text-sage font-semibold bg-sage/10 px-2.5 py-1 rounded-full border border-sage/20"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.25, delay: 1.8 } }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              +{transactions[active].roundUp} invested
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="text-4xl font-extrabold text-foreground tabular-nums tracking-tight">
          ${invested.toFixed(2)}
        </div>
        <div className="text-sm text-sage mt-1 font-medium">+12.4% all time</div>

        {/* Allocation bar */}
        <div className="mt-5 flex rounded-full overflow-hidden h-2 gap-0.5">
          {portfolio.map((p) => (
            <div key={p.asset} className="h-full rounded-full" style={{ width: `${p.allocation}%`, backgroundColor: p.color, opacity: 0.7 }} />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {portfolio.map((p) => (
            <div key={p.asset} className="text-center group/asset cursor-default hover:bg-muted rounded-lg py-1 transition-all">
              <div className="text-[10px] text-muted-foreground">{p.asset}</div>
              <div className="text-xs font-bold" style={{ color: p.color }}>{p.allocation}%</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Transaction feed */}
      <div className="space-y-2.5">
        {transactions.map((tx, i) => {
          const ChainIcon = chainIcons[tx.chain];
          return (
            <motion.div key={tx.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`relative p-4 rounded-xl border transition-all duration-500 ${
                i === active
                  ? "glass border-gold/20 shadow-md"
                  : "bg-card/40 border-border/30 opacity-50"
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${i === active ? "bg-gold/10" : "bg-muted"}`}>
                    {ChainIcon && <ChainIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{tx.label}</div>
                    <div className="text-[11px] text-muted-foreground">{tx.chain}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground">fee {tx.fee} → rounded to $1.00</div>
                  <div className={`text-xs font-semibold transition-colors ${i === active ? "text-gold" : "text-muted-foreground"}`}>
                    {tx.roundUp} → {tx.asset}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
