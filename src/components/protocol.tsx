"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { NumberTicker } from "@/components/effects/number-ticker";
import { SpotlightCard } from "@/components/effects/spotlight-card";

const stats = [
  { value: 2.4, prefix: "$", suffix: "M", decimals: 1, label: "Total invested", sublabel: "across all portfolios" },
  { value: 140, prefix: "", suffix: "K+", decimals: 0, label: "Round-ups", sublabel: "transactions processed" },
  { value: 12, prefix: "", suffix: "", decimals: 0, label: "Integrations", sublabel: "platforms live" },
  { value: 18.6, prefix: "", suffix: "%", decimals: 1, label: "Avg. return", sublabel: "portfolio performance" },
];

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <SpotlightCard className="h-full" spotlightSize={200}>
        <div className="stat-card bg-card p-8 md:p-10 text-center group cursor-default h-full">
          <div className="text-4xl md:text-5xl font-black text-foreground group-hover:text-gold transition-colors duration-500 number-glow tracking-tight">
            <NumberTicker
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              decimals={stat.decimals}
            />
          </div>
          <div className="text-base font-semibold text-foreground mt-3">{stat.label}</div>
          <div className="text-sm text-muted-foreground mt-1 group-hover:text-foreground/60 transition-colors duration-300">{stat.sublabel}</div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

export function Protocol() {
  return (
    <section id="protocol" className="relative py-24 overflow-hidden">
      <div className="gold-glow absolute inset-0 pointer-events-none" />

      {/* Subtle dot grid behind stats */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle 1px, rgba(59,130,246,0.4) 100%, transparent 100%)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="mx-auto px-6 lg:px-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30 rounded-md overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.06)]">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        <div className="mt-20">
          <div className="marquee-mask overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...Array(2)].flatMap((_, setIdx) =>
                ["Uniswap", "Aave", "OpenSea", "Lido", "Curve", "Jupiter", "Raydium", "GMX"].map(
                  (name, i) => (
                    <span
                      key={`${name}-${setIdx}-${i}`}
                      className="text-xl font-black tracking-tight mx-10 opacity-20 hover:opacity-50 hover:text-gold hover:scale-110 transition-all duration-300 cursor-default"
                    >
                      {name}
                    </span>
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
