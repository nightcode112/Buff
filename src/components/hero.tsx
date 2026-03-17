"use client";

import { Badge } from "@/components/ui/badge";
import { RoundUpVisual } from "@/components/round-up-visual";
import { TextReveal } from "@/components/effects/text-reveal";
import { MagneticButton } from "@/components/effects/magnetic-button";

export function Hero() {
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
