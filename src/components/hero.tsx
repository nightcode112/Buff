"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { RoundUpVisual } from "@/components/round-up-visual";
import { TextReveal } from "@/components/effects/text-reveal";
import { MagneticButton } from "@/components/effects/magnetic-button";

function useStats() {
  const [stars, setStars] = useState<number | null>(null);
  const [downloads, setDownloads] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/nightcode112/Buff")
      .then(r => r.json())
      .then(d => { if (d.stargazers_count != null) setStars(d.stargazers_count); })
      .catch(() => {});

    fetch("https://api.npmjs.org/downloads/point/last-month/buff-protocol-sdk")
      .then(r => r.json())
      .then(d => { if (d.downloads != null) setDownloads(d.downloads); })
      .catch(() => {});
  }, []);

  return { stars, downloads };
}

export function Hero() {
  const { stars, downloads } = useStats();
  return (
    <section className="relative min-h-[100vh] flex flex-col justify-center overflow-hidden sky-hero">
      {/* Soft circles */}
      <div className="absolute top-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-gold/[0.06] blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-amber-300/[0.06] blur-[60px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 pt-32 pb-24 w-full relative z-10">
        <div className="grid lg:grid-cols-[1fr_460px] gap-20 items-center">
          <div className="max-w-2xl">
            <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <Badge variant="outline" className="border-gold/20 text-gold/60 bg-card/60 backdrop-blur mb-8 tracking-[0.1em] uppercase shadow-sm h-auto py-1 px-2.5">
                Round-up investing for humans & agents
              </Badge>
            </div>

            <h1 className="text-[clamp(3rem,7vw,5.5rem)] leading-[1.05] font-extrabold tracking-[-0.03em] mb-8 text-foreground overflow-visible">
              <TextReveal delay={0.2}>Round up.</TextReveal>
              <br />
              <span className="shimmer-text italic font-black block pb-[0.1em] pr-[0.15em]">
                <TextReveal delay={0.5}>Auto-invest.</TextReveal>
              </span>
            </h1>

            <p className="animate-fade-up text-xl text-muted-foreground leading-relaxed max-w-lg mb-12" style={{ animationDelay: "0.35s" }}>
              Buff rounds up every onchain transaction and auto-invests the spare change into crypto assets. A drop-in SDK for any platform — works for human users and AI agents alike.
            </p>

            <div className="animate-fade-up flex flex-wrap gap-4 items-center" style={{ animationDelay: "0.5s" }}>
              <MagneticButton strength={0.2}>
                <a href="/docs/quickstart" className="bg-foreground text-background text-base font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity inline-block">
                  Start integrating
                </a>
              </MagneticButton>
              <MagneticButton strength={0.15}>
                <a href="/docs" className="bg-card text-foreground text-base font-medium px-8 py-3.5 rounded-full border border-border hover:border-primary/30 hover:shadow-md transition-all inline-block">
                  Read the docs
                </a>
              </MagneticButton>
            </div>

            <div className="animate-fade-up mt-14 flex items-center gap-8" style={{ animationDelay: "0.65s" }}>
              {["Non-custodial", "Open source", "Solana native", "AI agent ready"].map((label) => (
                <span key={label} className="flex items-center gap-2 text-sm text-muted-foreground group cursor-default">
                  <span className="w-5 h-5 rounded-full bg-sage/10 border border-sage/20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                  </span>
                  <span className="group-hover:text-foreground transition-colors">{label}</span>
                </span>
              ))}
            </div>

            <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-2.5" style={{ animationDelay: "0.8s" }}>
              <a href="https://github.com/nightcode112/Buff" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors px-2.5 py-1 rounded-full border border-border/30 bg-card/40 backdrop-blur-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-60"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <span>{stars != null ? `${stars} stars` : "GitHub"}</span>
              </a>
              <a href="https://www.npmjs.com/package/buff-protocol-sdk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors px-2.5 py-1 rounded-full border border-border/30 bg-card/40 backdrop-blur-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-60"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0h-2.666V8.667h2.666v5.331zm12.001 0h-1.333v-4h-1.334v4h-1.333v-4h-1.334v4h-2.666V8.667h8v5.331z"/></svg>
                <span>{downloads != null ? `${downloads.toLocaleString()} downloads` : "npm"}</span>
              </a>
              <a href="https://www.npmjs.com/package/buff-protocol-sdk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors px-2.5 py-1 rounded-full border border-border/30 bg-card/40 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                <span>v1.0.1</span>
              </a>
            </div>
          </div>

          <div className="animate-fade-up hidden lg:block" style={{ animationDelay: "0.4s" }}>
            <RoundUpVisual />
          </div>
        </div>
      </div>

      <div className="divider-gold w-full" />
    </section>
  );
}
