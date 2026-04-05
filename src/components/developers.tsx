"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    title: "Framework agnostic",
    desc: "Works with React, Vue, Svelte, or vanilla JS. No opinions, no lock-in.",
  },
  {
    title: "Configurable thresholds",
    desc: "Round to nearest dollar, $5, or let users set their own ceiling.",
  },
{
    title: "Revenue sharing",
    desc: "Earn a cut of every round-up your platform generates.",
  },
];

const codeLines = [
  { content: "import", hl: "#93c5fd", rest: [{ t: "{ ", c: "#e2e8f0" }, { t: "Buff", c: "#00ffaa" }, { t: " }", c: "#e2e8f0" }, { t: " from", c: "#93c5fd" }, { t: " 'buff-protocol-sdk'", c: "#fbbf24" }] },
  { content: "", spacer: true },
  { content: "// Round up fees, auto-invest the difference", comment: true },
  { content: "const", hl: "#93c5fd", rest: [{ t: " buff", c: "#e2e8f0" }, { t: " = ", c: "#555" }, { t: "new", c: "#93c5fd" }, { t: " Buff", c: "#00ffaa" }, { t: "({", c: "#555" }] },
  { content: "  apiKey", hl: "#e2e8f0", rest: [{ t: ": ", c: "#555" }, { t: "'your-api-key'", c: "#fbbf24" }, { t: ",", c: "#555" }] },
  { content: "  plan", hl: "#e2e8f0", rest: [{ t: ": ", c: "#555" }, { t: "'sprout'", c: "#fbbf24" }, { t: ",", c: "#555" }] },
  { content: "  investInto", hl: "#e2e8f0", rest: [{ t: ": ", c: "#555" }, { t: "'BTC'", c: "#fbbf24" }, { t: ",", c: "#555" }] },
  { content: "})", hl: "#555", rest: [] },
  { content: "", spacer: true },
  { content: "// Get round-up instructions for any tx", comment: true },
  { content: "const", hl: "#93c5fd", rest: [{ t: " { instructions }", c: "#e2e8f0" }, { t: " = ", c: "#555" }, { t: "await", c: "#93c5fd" }, { t: " buff", c: "#e2e8f0" }, { t: ".", c: "#555" }, { t: "getWrapInstructions", c: "#00ffaa" }, { t: "(usd, pk, bw)", c: "#555" }] },
];

export function Developers() {
  const codeRef = useRef(null);
  const codeInView = useInView(codeRef, { once: true, margin: "-80px" });

  return (
    <section id="developers" className="relative py-12 sm:py-24 lg:pb-56 min-[2000px]:pb-24 overflow-hidden w-full" style={{ zIndex: 5 }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-16">
        <div className="bg-[#00000008] dark:bg-[#ffffff06] border border-[#00000010] dark:border-[#ffffff08] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          <div>
            <span className="text-[11px] text-muted-foreground uppercase tracking-[0.3em] font-light mb-6 block ml-1">Integration</span>
            <h2 className="text-[clamp(2rem,8vw,6rem)] leading-[0.9] font-extrabold tracking-[-0.03em] mb-6 sm:mb-8">
              Five lines.
              <br />
              That&apos;s it.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-snug mb-8 sm:mb-10 max-w-md">
              Buff is a lightweight TypeScript SDK that wraps any transaction
              provider. It rounds up the fee, invests the difference, and builds
              your users a portfolio — all behind the scenes.
            </p>

            <div className="space-y-2">
              {features.map((feature, i) => (
                <div key={feature.title} className="group cursor-default py-3 px-4 border border-[#00000008] dark:border-[#ffffff08] hover:bg-[#00000005] dark:hover:bg-[#ffffff03] transition-all duration-300">
                  <h4 className="text-sm font-bold mb-1 group-hover:text-[#00ffaa] transition-colors duration-300">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-normal">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Code block */}
          <div className="lg:sticky lg:top-28 relative z-10" ref={codeRef}>
            <div className="relative">
              <div className="bg-[#000000] border border-[#ffffff08] rounded-none overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffffff20] to-transparent" />

                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#ffffff08]">
                  <span className="text-[10px] text-[#555] uppercase tracking-[0.2em] font-medium">integration.ts</span>
                  <span className="text-[10px] text-[#555] uppercase tracking-[0.2em] font-medium">TypeScript</span>
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
                        <span style={{ color: "#444" }}>{line.content}</span>
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
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={codeInView ? { opacity: [0, 1, 0] } : {}}
                    transition={{ duration: 1, repeat: Infinity, delay: 1.5 }}
                    className="inline-block w-[2px] h-4 bg-[#555] ml-1 align-middle"
                  />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={codeInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 1.5 }}
                className="mt-3 bg-[#000000] border border-[#ffffff08] flex items-center gap-3 px-5 py-4 group cursor-pointer"
              >
                <span className="text-[#555] text-sm font-mono">$</span>
                <code className="text-sm text-white font-mono flex-1">npm install buff-protocol-sdk</code>
                <button className="text-[10px] text-[#555] hover:text-white transition-colors duration-300 font-medium uppercase tracking-[0.2em]">Copy</button>
              </motion.div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
