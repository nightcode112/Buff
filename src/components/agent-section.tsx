"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TiltCard } from "@/components/effects/tilt-card";
import { GlowBorder } from "@/components/effects/glow-border";

const features = [
  {
    title: "Headless SDK",
    description:
      "No popups, no browser wallets. Just pass an API key and go. Built for server-side and autonomous agents.",
    code: `new Buff({ apiKey })`,
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
    code: `buff.calculateRoundUp(cost)`,
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
    code: `buff.deriveWallet(signature)`,
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

        {/* Integration links */}
        <div className="mt-14 flex flex-wrap justify-center gap-3">
          <a href="https://www.npmjs.com/package/buff-elizaos-plugin" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-gold/30 hover:shadow-md transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-60"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0h-2.666V8.667h2.666v5.331zm12.001 0h-1.333v-4h-1.334v4h-1.333v-4h-1.334v4h-2.666V8.667h8v5.331z"/></svg>
            ElizaOS Plugin
          </a>
          <a href="https://clawhub.com/nightcode112/buff-roundup" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-gold/30 hover:shadow-md transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-60"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
            ClawHub Skill
          </a>
          <a href="/SKILL.md" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-gold/30 hover:shadow-md transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-60"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
            SKILL.md
          </a>
          <a href="/docs/guides/skills" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-gold/30 hover:shadow-md transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-60"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            All Plugins
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">Available on ElizaOS, ClawHub, Claude Code, and any agent that reads SKILL.md</p>
      </div>
    </section>
  );
}
