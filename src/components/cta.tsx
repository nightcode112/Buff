"use client";

import { SpotlightCard } from "@/components/effects/spotlight-card";
import { MagneticButton } from "@/components/effects/magnetic-button";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 sky-gradient" ref={ref}>
      <div className="gold-glow absolute inset-0 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6">
        <SpotlightCard className="rounded-3xl" spotlightSize={400} spotlightColor="rgba(59,130,246,0.06)">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Animated gradient bg */}
            <div
              className="absolute inset-0 animate-gradient-shift"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.05) 0%, transparent 25%, rgba(16,185,129,0.03) 50%, transparent 75%, rgba(59,130,246,0.04) 100%)",
                backgroundSize: "200% 200%",
              }}
            />
            <div className="absolute inset-0 border border-gold/10 rounded-3xl" />
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            {/* Floating elements */}
            <div className="absolute top-8 left-12 w-16 h-16 rounded-full bg-gold/[0.04] border border-gold/10 animate-float" style={{ animationDelay: "0s" }} />
            <div className="absolute bottom-12 right-16 w-10 h-10 rounded-full bg-sage/[0.06] border border-sage/10 animate-float" style={{ animationDelay: "2s" }} />
            <div className="absolute top-1/3 right-1/4 w-6 h-6 rounded-full bg-gold/[0.05] animate-float-slow" style={{ animationDelay: "4s" }} />
            <div className="absolute bottom-1/4 left-1/4 w-8 h-8 rounded-full bg-gold/[0.03] border border-gold/5 animate-float" style={{ animationDelay: "3s" }} />

            {/* Shine sweep on enter */}
            <motion.div
              initial={{ x: "-100%", opacity: 0.5 }}
              animate={isInView ? { x: "200%", opacity: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(59,130,246,0.06) 50%, transparent 60%)",
              }}
            />

            <div className="relative p-12 md:p-24 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[0.95]"
              >
                Start investing
                <br />
                <span className="shimmer-text">spare change</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-muted-foreground max-w-lg mx-auto mb-12 leading-relaxed text-xl"
              >
                Help your users build crypto portfolios from every transaction.
                Integrate Buff in minutes, not months.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-5 justify-center items-center"
              >
                <MagneticButton strength={0.25}>
                  <a href="/docs/quickstart" className="btn-gold text-base font-bold px-10 py-4 rounded-xl animate-pulse-glow inline-block">
                    Get your API key
                  </a>
                </MagneticButton>
                <MagneticButton strength={0.15}>
                  <a href="/docs" className="btn-outline-luxury text-base font-semibold px-10 py-4 rounded-xl inline-block">
                    Read the docs
                  </a>
                </MagneticButton>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-sm text-muted-foreground mt-10 flex items-center justify-center gap-2"
              >
                <span className="relative w-1.5 h-1.5 rounded-full bg-sage shadow-[0_0_6px_rgba(16,185,129,0.5)] live-dot" />
                Free to integrate — Revenue share on round-ups
              </motion.p>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
