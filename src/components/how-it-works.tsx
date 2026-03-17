"use client";

import { TiltCard } from "@/components/effects/tilt-card";
import { GlowBorder } from "@/components/effects/glow-border";
import { AnimatedBeam } from "@/components/effects/animated-beam";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    title: "Human or agent transacts",
    description:
      "A user swaps tokens, an AI agent calls an API, or a bot sends a payment — any onchain action. Buff hooks into the transaction lifecycle silently.",
    detail: "Zero UX friction",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Fee gets rounded up",
    description:
      "The gas fee is rounded up to the nearest dollar (or configurable threshold). The difference is captured automatically.",
    detail: "Avg. $0.47 per tx",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M8 10h8M9 14h6" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Spare change gets invested",
    description:
      "The round-up difference is auto-invested into crypto assets — ETH, BTC, SOL, or a custom mix. Portfolio grows with every tx.",
    detail: "Auto-diversified",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 20h20M5 20V10M9 20V4M13 20V8M17 20V6M21 20V12" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Portfolio compounds",
    description:
      "Users build a diversified crypto portfolio passively. Fully withdrawable, fully transparent, fully onchain. Every tx counts.",
    detail: "100% non-custodial",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard tiltAmount={6}>
        <GlowBorder borderRadius="1rem">
          <div className="premium-card shine-on-hover rounded-2xl p-7 h-full group">
            <div className="flex items-center justify-between mb-6">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gold/[0.07] border border-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/[0.12] group-hover:border-gold/20 group-hover:shadow-[0_0_24px_rgba(59,130,246,0.1)] transition-all duration-500"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {step.icon}
              </motion.div>
              <span className="text-5xl font-black text-border/60 group-hover:text-gold/15 transition-colors duration-500 select-none">
                {step.num}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-3 group-hover:text-gold transition-colors duration-300">
              {step.title}
            </h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-5">
              {step.description}
            </p>

            <span className="inline-flex items-center gap-1.5 text-xs text-sage font-semibold bg-sage/[0.08] px-3 py-1.5 rounded-lg border border-sage/10 group-hover:bg-sage/[0.15] group-hover:border-sage/25 group-hover:shadow-[0_4px_16px_rgba(16,185,129,0.1)] group-hover:scale-105 transition-all duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-sage" />
              {step.detail}
            </span>
          </div>
        </GlowBorder>
      </TiltCard>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden bg-background">
      <div className="gold-glow-center absolute inset-0 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[11px] text-gold uppercase tracking-[0.25em] font-semibold">
            How it works
          </span>
          <h2 className="text-4xl md:text-[3.5rem] font-extrabold tracking-tight mt-5 leading-tight">
            Every fee
            <br />
            <span className="shimmer-text">builds a portfolio</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-5 max-w-md mx-auto leading-relaxed">
            Four steps. Zero friction. Every transaction fee becomes an investment in crypto assets.
          </p>
        </div>

        <div className="relative">
          <AnimatedBeam />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
            {steps.map((step, i) => (
              <StepCard key={step.num} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
