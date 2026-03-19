"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const socialColors: Record<string, string> = {
    X: "hover:shadow-[0_4px_12px_rgba(255,255,255,0.08)] hover:border-white/20",
    GH: "hover:shadow-[0_4px_12px_rgba(40,200,64,0.1)] hover:border-[#28c840]/30",
    DC: "hover:shadow-[0_4px_12px_rgba(88,101,242,0.1)] hover:border-[#5865f2]/30",
  };

  return (
    <footer ref={ref} className="border-t border-border/30 py-20 relative bg-card">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: "radial-gradient(circle 1px, rgba(59,130,246,0.3) 100%, transparent 100%)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <motion.div
            className="col-span-2 md:col-span-1"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/15 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.1)] transition-all duration-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gold">
                  <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="currentColor" opacity="0.4" />
                  <path d="M12 14V22M12 14C9.79 14 8 12.21 8 10M12 14C14.21 14 16 12.21 16 10M8 18H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight group-hover:text-gold transition-colors">Buff</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              The onchain round-up protocol. Every fee builds a portfolio.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { label: "X", href: "#" },
                { label: "GH", href: "#" },
                { label: "DC", href: "#" },
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className={`w-9 h-9 rounded-lg bg-secondary border border-border/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground hover:text-gold hover:bg-gold/5 transition-all duration-300 ${socialColors[social.label]}`}
                >
                  {social.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {[
            {
              title: "Product",
              links: [
                { label: "How it works", href: "/#how-it-works" },
                { label: "Developers", href: "/#developers" },
                { label: "Chains", href: "/#chains" },
                { label: "Plans", href: "/docs/plans" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "Documentation", href: "/docs" },
                { label: "Quick Start", href: "/docs/quickstart" },
                { label: "Round-Ups", href: "/docs/round-ups" },
                { label: "Wallet", href: "/docs/wallet" },
              ],
            },
            {
              title: "Community",
              links: [
                { label: "GitHub", href: "#" },
                { label: "Discord", href: "#" },
                { label: "Twitter", href: "#" },
                { label: "Blog", href: "#" },
              ],
            },
          ].map((col, colIdx) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + colIdx * 0.1 }}
            >
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-5 font-semibold">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.3 + colIdx * 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="text-[15px] text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-300 inline-block"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="divider-gold mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Buff Protocol. All rights reserved.
          </p>
          <div className="flex gap-8">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Security", href: "#" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground link-hover transition-colors duration-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
