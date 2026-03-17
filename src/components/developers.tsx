"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/effects/spotlight-card";

const features = [
  {
    title: "Framework agnostic",
    desc: "Works with React, Vue, Svelte, or vanilla JS. No opinions, no lock-in.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "Configurable thresholds",
    desc: "Round to nearest dollar, $5, or let users set their own ceiling.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    title: "Solana native",
    desc: "Built for Solana. Lightning fast, sub-cent fees. More chains coming soon.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: "Revenue sharing",
    desc: "Earn a cut of every round-up your platform generates. Aligned incentives.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <SpotlightCard className="rounded-xl" spotlightSize={160}>
        <div className="group glass glass-hover rounded-xl p-5 cursor-default">
          <div className="flex items-start gap-4">
            <motion.div
              className="w-10 h-10 rounded-lg bg-gold/[0.06] border border-gold/10 flex items-center justify-center text-gold shrink-0 group-hover:bg-gold/[0.12] group-hover:border-gold/20 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.08)] transition-all duration-400"
              whileHover={{ scale: 1.1 }}
            >
              {feature.icon}
            </motion.div>
            <div>
              <h4 className="text-base font-bold mb-1 group-hover:text-gold transition-colors duration-300">
                {feature.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

export function Developers() {
  const codeRef = useRef(null);
  const codeInView = useInView(codeRef, { once: true, margin: "-80px" });

  const codeLines = [
    { content: "import", hl: "#93c5fd", rest: [{ t: "{ ", c: "#e2e8f0" }, { t: "Buff", c: "#34d399" }, { t: " }", c: "#e2e8f0" }, { t: " from", c: "#93c5fd" }, { t: " '@buff/sdk'", c: "#fbbf24" }] },
    { content: "", spacer: true },
    { content: "// Round up fees, auto-invest the difference", comment: true },
    { content: "const", hl: "#93c5fd", rest: [{ t: " buff", c: "#e2e8f0" }, { t: " = ", c: "#64748b" }, { t: "new", c: "#93c5fd" }, { t: " Buff", c: "#34d399" }, { t: "({", c: "#64748b" }] },
    { content: "  apiKey", hl: "#e2e8f0", rest: [{ t: ": ", c: "#64748b" }, { t: "'your-api-key'", c: "#fbbf24" }, { t: ",", c: "#64748b" }] },
    { content: "  plan", hl: "#e2e8f0", rest: [{ t: ": ", c: "#64748b" }, { t: "'sprout'", c: "#fbbf24" }, { t: ",", c: "#64748b" }] },
    { content: "  investInto", hl: "#e2e8f0", rest: [{ t: ": ", c: "#64748b" }, { t: "'BTC'", c: "#fbbf24" }, { t: ",", c: "#64748b" }] },
    { content: "})", hl: "#64748b", rest: [] },
    { content: "", spacer: true },
    { content: "// Get round-up instructions for any tx", comment: true },
    { content: "const", hl: "#93c5fd", rest: [{ t: " { instructions }", c: "#e2e8f0" }, { t: " = ", c: "#64748b" }, { t: "await", c: "#93c5fd" }, { t: " buff", c: "#e2e8f0" }, { t: ".", c: "#64748b" }, { t: "getWrapInstructions", c: "#34d399" }, { t: "(usd, pk, bw)", c: "#64748b" }] },
  ];

  return (
    <section id="developers" className="relative py-32 overflow-hidden bg-card">
      <div className="gold-glow-center absolute inset-0 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div>
            <span className="text-[11px] text-sage uppercase tracking-[0.25em] font-semibold">
              For developers
            </span>
            <h2 className="text-4xl md:text-[3.5rem] font-extrabold tracking-tight mt-5 mb-6 leading-tight">
              Five lines.
              <br />
              <span className="shimmer-text">That&apos;s it.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-md">
              Buff is a lightweight TypeScript SDK that wraps any transaction
              provider. It rounds up the fee, invests the difference, and builds
              your users a portfolio — all behind the scenes.
            </p>

            <div className="space-y-3">
              {features.map((feature, i) => (
                <FeatureCard key={feature.title} feature={feature} index={i} />
              ))}
            </div>
          </div>

          {/* Code block with typing animation */}
          <div className="lg:sticky lg:top-28" ref={codeRef}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gold/[0.02] rounded-3xl blur-2xl pointer-events-none" />

              <SpotlightCard className="rounded-2xl" spotlightSize={300} spotlightColor="rgba(59,130,246,0.04)">
                <div className="code-block rounded-2xl overflow-hidden relative shine-on-hover">
                  <div className="flex items-center gap-2 px-5 pt-5 pb-0">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_6px_rgba(255,95,87,0.3)]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[0_0_6px_rgba(254,188,46,0.3)]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_6px_rgba(40,200,64,0.3)]" />
                  </div>

                  <div className="flex items-center gap-4 px-5 pt-4 pb-3 border-b border-border/30">
                    <Badge variant="outline" className="border-gold/20 text-gold bg-gold/5 text-[10px] font-mono shadow-[0_0_8px_rgba(59,130,246,0.05)]">
                      TypeScript
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">integration.ts</span>
                  </div>

                  <div className="p-6 font-mono text-[13px] leading-8 overflow-x-auto">
                    {codeLines.map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={codeInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                        className={line.spacer ? "h-4" : ""}
                      >
                        {line.comment ? (
                          <span style={{ color: "#475569" }}>{line.content}</span>
                        ) : line.spacer ? null : (
                          <>
                            <span style={{ color: line.hl }}>{line.content}</span>
                            {line.rest?.map((part, j) => (
                              <span key={j} style={{ color: part.c }}>{part.t}</span>
                            ))}
                          </>
                        )}
                      </motion.div>
                    ))}
                    {/* Blinking cursor */}
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={codeInView ? { opacity: [0, 1, 0] } : {}}
                      transition={{ duration: 1, repeat: Infinity, delay: 1.5 }}
                      className="inline-block w-[2px] h-4 bg-muted-foreground ml-1 align-middle"
                    />
                  </div>
                </div>
              </SpotlightCard>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={codeInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 1.5 }}
                className="mt-4 glass glass-hover flex items-center gap-3 px-5 py-4 rounded-xl group cursor-pointer"
              >
                <span className="text-gold/40 text-sm font-mono">$</span>
                <code className="text-sm text-foreground font-mono flex-1">npm install @buff/sdk</code>
                <button className="text-xs text-muted-foreground hover:text-gold transition-colors duration-300 font-medium uppercase tracking-wider">Copy</button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
