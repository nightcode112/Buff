"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TiltCard } from "@/components/effects/tilt-card";
import { GlowBorder } from "@/components/effects/glow-border";

const features = [
  {
    title: "Headless SDK",
    description:
      "No popups, no browser wallets. Just pass a keypair and go. Built for server-side and autonomous agents.",
    code: `Buff.init({ agentKeypair })`,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8l3 3-3 3M12 14h4" />
      </svg>
    ),
  },
  {
    title: "x402 Middleware",
    description:
      "Round up API payments automatically. Every HTTP 402 payment your agent makes can generate spare change for investing.",
    code: `middleware: "x402-roundup"`,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Agent Wallets",
    description:
      "Programmatic, deterministic, and exportable. Derive wallets from agent IDs with no browser or user interaction required.",
    code: `wallet: "deterministic"`,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M21 12V7H5a2 2 0 010-4h14v4" />
        <path d="M3 5v14a2 2 0 002 2h16v-5" />
        <circle cx="18" cy="16" r="2" />
      </svg>
    ),
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
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
            <motion.div
              className="w-12 h-12 rounded-xl bg-gold/[0.07] border border-gold/10 flex items-center justify-center text-gold mb-6 group-hover:bg-gold/[0.12] group-hover:border-gold/20 group-hover:shadow-[0_0_24px_rgba(59,130,246,0.1)] transition-all duration-500"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {feature.icon}
            </motion.div>

            <h3 className="text-xl font-bold mb-3 group-hover:text-gold transition-colors duration-300">
              {feature.title}
            </h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-5">
              {feature.description}
            </p>

            <div className="bg-secondary/40 border border-border/30 rounded-lg px-4 py-2.5">
              <code className="text-sm font-mono text-gold/80">{feature.code}</code>
            </div>
          </div>
        </GlowBorder>
      </TiltCard>
    </motion.div>
  );
}

export function AgentSection() {
  return (
    <section id="agents" className="relative py-32 overflow-hidden bg-background">
      <div className="gold-glow-center absolute inset-0 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[11px] text-gold uppercase tracking-[0.25em] font-semibold">
            Agent support
          </span>
          <h2 className="text-4xl md:text-[3.5rem] font-extrabold tracking-tight mt-5 leading-tight">
            Built for
            <br />
            <span className="shimmer-text">AI agents</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-5 max-w-md mx-auto leading-relaxed">
            Headless, programmatic, zero-friction. Let your agents round up and invest autonomously.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        {/* SKILL.md link */}
        <div className="mt-12 text-center">
          <a
            href="/SKILL.md"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-gold/30 hover:shadow-md transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
            SKILL.md
          </a>
          <p className="text-xs text-muted-foreground mt-2">Fetch this file from any agent to integrate Buff</p>
        </div>
      </div>
    </section>
  );
}
