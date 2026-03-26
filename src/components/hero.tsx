"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RoundUpVisual } from "@/components/round-up-visual";
import { TextReveal } from "@/components/effects/text-reveal";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    let st: ScrollTrigger | undefined;
    if (section && window.matchMedia("(min-width: 1024px)").matches) {
      st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${section.offsetHeight}`,
        pin: true,
        pinSpacing: false,
      });

      // Fade out hero as how-it-works covers it
      const howItWorks = document.getElementById("how-it-works");
      if (howItWorks) {
        gsap.to(section, {
          opacity: 0,
          scrollTrigger: {
            trigger: howItWorks,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      }
    }

    const tl = gsap.timeline({ delay: 0.6 });
    tl.to([subRef.current, btnRef.current, statsRef.current], {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: "power3.out",
    });

    return () => { st?.kill(); };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[100vh] flex flex-col justify-center overflow-hidden">

      <div className="mx-auto px-6 lg:px-16 pt-32 pb-24 w-full max-w-[1920px] relative z-10">
        <div className="lg:pr-[640px] xl:pr-[720px]">
          <div>
            <span className="text-[11px] text-muted-foreground uppercase tracking-[0.3em] font-light mb-6 lg:mb-8 block ml-1">Onchain round-up protocol</span>
            <h1 className="text-[clamp(3.25rem,10vw,9rem)] leading-[0.9] font-bold tracking-[-0.03em] mb-6 lg:mb-10 text-foreground">
              <span className="block whitespace-nowrap"><TextReveal delay={0.2}>Auto-invest</TextReveal></span>
              <span className="block whitespace-nowrap"><TextReveal delay={0.4}>spare change.</TextReveal></span>
            </h1>

            <p ref={subRef} className="text-[clamp(1rem,2.5vw,1.25rem)] text-muted-foreground leading-relaxed max-w-2xl mb-6 lg:mb-10 opacity-0 translate-y-2">
              Buff is a lightweight SDK that turns every onchain transaction into a micro-investment. It rounds up the fee, invests the difference, and builds your users a portfolio — all behind the scenes.
            </p>

            <div className="flex flex-wrap items-center gap-6 opacity-0 translate-y-2" ref={btnRef}>
              <a href="/docs/quickstart" className="inline-flex items-center justify-center gap-1.5 h-12 lg:h-14 px-6 lg:px-8 text-base lg:text-lg capitalize font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all">
                Get started
              </a>
              <div ref={statsRef} className="flex items-center divide-x divide-black/20 dark:divide-border/50 opacity-0 translate-y-2">
                {[
                  { value: "$2.4M", label: "Invested" },
                  { value: "140K+", label: "Round-ups" },
                  { value: "18.6%", label: "Returns" },
                ].map((stat) => (
                  <div key={stat.label} className="cursor-default px-3 lg:px-4 first:pl-0">
                    <div className="text-xs lg:text-sm font-bold text-foreground tracking-tight">{stat.value}</div>
                    <div className="text-[9px] lg:text-[10px] text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile only card */}
          <div className="lg:hidden mt-12">
            <RoundUpVisual />
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-8 left-0 right-0">
        <div className="marquee-mask overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].flatMap((_, setIdx) =>
              ["Uniswap", "Aave", "OpenSea", "Lido", "Curve", "Jupiter", "Raydium", "GMX"].map(
                (name, i) => (
                  <span
                    key={`${name}-${setIdx}-${i}`}
                    className="text-xl font-black tracking-tight mx-10 opacity-[0.08] hover:opacity-30 transition-all duration-300 cursor-default"
                  >
                    {name}
                  </span>
                )
              )
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
