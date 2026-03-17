"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { chainIcons } from "@/components/chain-icons";
import { SpotlightCard } from "@/components/effects/spotlight-card";
import { TiltCard } from "@/components/effects/tilt-card";

const chains = [
  { name: "Solana", status: "live", tvl: "$180K", color: "#9945FF" },
  { name: "Ethereum", status: "soon", tvl: "—", color: "#627EEA" },
  { name: "Base", status: "soon", tvl: "—", color: "#0052FF" },
  { name: "Arbitrum", status: "soon", tvl: "—", color: "#28A0F0" },
];

function ChainCard({ chain, index }: { chain: typeof chains[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const Icon = chainIcons[chain.name];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard tiltAmount={5}>
        <SpotlightCard
          className="rounded-2xl"
          spotlightColor={`${chain.color}15`}
          spotlightSize={180}
        >
          <div className="chain-pill premium-card shine-on-hover rounded-2xl p-5 h-full group cursor-default">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500"
                style={{
                  background: `${chain.color}10`,
                  border: `1px solid ${chain.color}20`,
                }}
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {Icon && <Icon className="w-6 h-6" />}
              </motion.div>

              <div className="flex-1">
                <div className="text-base font-bold group-hover:text-gold transition-colors duration-300">
                  {chain.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`relative w-1.5 h-1.5 rounded-full ${
                      chain.status === "live"
                        ? "bg-sage shadow-[0_0_6px_rgba(16,185,129,0.5)] live-dot"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold ${
                      chain.status === "live" ? "text-sage" : "text-muted-foreground"
                    }`}
                  >
                    {chain.status}
                  </span>
                </div>
              </div>
            </div>

            {chain.status === "live" && (
              <div className="pt-3 border-t border-border/30">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">TVL</div>
                <div className="text-lg font-bold text-foreground group-hover:text-gold group-hover:scale-110 origin-left transition-all duration-300 number-glow">
                  {chain.tvl}
                </div>
              </div>
            )}

            {chain.status === "soon" && (
              <div className="pt-3 border-t border-border/30">
                <div className="text-sm text-muted-foreground italic group-hover:text-foreground/60 transition-colors duration-300">Coming soon</div>
              </div>
            )}
          </div>
        </SpotlightCard>
      </TiltCard>
    </motion.div>
  );
}

export function ChainsSection() {
  return (
    <section id="chains" className="relative py-32 overflow-hidden sky-gradient">
      <div className="sage-glow absolute inset-0 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] text-sage uppercase tracking-[0.25em] font-semibold">
            Live on Solana
          </span>
          <h2 className="text-4xl md:text-[3.5rem] font-extrabold tracking-tight mt-5 leading-tight">
            Built on
            <br />
            <span className="shimmer-text">Solana.</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-5 max-w-md mx-auto leading-relaxed">
            Live on Solana today. More chains coming soon.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {chains.map((chain, i) => (
            <ChainCard key={chain.name} chain={chain} index={i} />
          ))}
        </div>

        {/* Double marquee with fade masks */}
        <div className="mt-16 space-y-3">
          <div className="marquee-mask overflow-hidden opacity-15">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...chains, ...chains, ...chains].map((chain, i) => (
                <span key={i} className="text-3xl font-black tracking-tight mx-8">
                  {chain.name}
                </span>
              ))}
            </div>
          </div>
          <div className="marquee-mask overflow-hidden opacity-10">
            <div className="flex animate-marquee-reverse whitespace-nowrap">
              {[...chains, ...chains, ...chains].reverse().map((chain, i) => (
                <span key={i} className="text-2xl font-bold tracking-tight mx-6 text-gold/30">
                  {chain.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
