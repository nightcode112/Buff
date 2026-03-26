"use client";

import { useEffect, useRef, Children, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ParallaxStack({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Only enable parallax on lg screens
    const mql = window.matchMedia("(min-width: 1024px)");
    if (!mql.matches) return;

    const panels = gsap.utils.toArray<HTMLElement>(
      container.querySelectorAll(":scope > .parallax-panel")
    );

    panels.forEach((panel, i) => {
      if (i === panels.length - 1) return;

      ScrollTrigger.create({
        trigger: panel,
        start: "top top",
        pin: true,
        pinSpacing: false,
        scrub: true,
        end: () => `+=${panel.offsetHeight}`,
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} data-pinned-container>
      {Children.map(children, (child, i) => (
        <div
          className="parallax-panel relative"
          style={{ zIndex: i + 1 }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
