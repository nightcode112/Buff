"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const devCards = [
  {
    title: "Five lines. That's it.",
    description: "A lightweight TypeScript SDK that wraps any transaction provider. It rounds up the fee, invests the difference, and builds your users a portfolio.",
  },
  {
    title: "Framework agnostic",
    description: "Works with React, Vue, Svelte, or vanilla JS. No opinions, no lock-in.",
  },
  {
    title: "Configurable thresholds",
    description: "Round to nearest dollar, $5, or let users set their own ceiling.",
  },
  {
    title: "Revenue sharing",
    description: "Earn a cut of every round-up your platform generates. Aligned incentives.",
  },
];

export function DevScroll() {
  const wrapperRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const strip = stripRef.current;
    if (!wrapper || !strip) return;

    let stripWidth = strip.scrollWidth;
    let scrollLength = stripWidth - window.innerWidth;

    function refresh() {
      stripWidth = strip!.scrollWidth;
      scrollLength = stripWidth - window.innerWidth;
    }

    gsap.to(strip, {
      x: () => -scrollLength,
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        pin: true,
        scrub: true,
        start: "center center",
        end: () => `+=${stripWidth}`,
        invalidateOnRefresh: true,
      },
    });

    ScrollTrigger.addEventListener("refreshInit", refresh);

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", refresh);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={wrapperRef} className="overflow-hidden bg-white dark:bg-black" style={{ zIndex: 2 }}>
      <div ref={stripRef} className="flex flex-nowrap items-center will-change-transform">
        {/* First item: the title */}
        <div className="shrink-0 w-screen flex items-center px-6 lg:px-16">
          <h2 className="text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] font-bold tracking-[-0.03em] whitespace-nowrap">
            Optimized for developers
          </h2>
        </div>

        {/* Developer cards */}
        {devCards.map((card, i) => (
          <div
            key={i}
            className="shrink-0 w-[80vw] md:w-[50vw] lg:w-[40vw] p-8 lg:p-12 border border-[#ffffff08] bg-[#000000] mx-4"
          >
            <h3 className="text-2xl lg:text-4xl font-bold mb-4">
              {card.title}
            </h3>
            <p className="text-[clamp(1rem,2.5vw,1.25rem)] text-muted-foreground leading-relaxed">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
