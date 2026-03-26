"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RoundUpVisual } from "@/components/round-up-visual";

gsap.registerPlugin(ScrollTrigger);

export function FixedVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    const scope = document.querySelector("[data-visual-scope]") as HTMLElement;
    const howItWorks = document.getElementById("how-it-works");
    if (!scope || !howItWorks) return;

    // Fade in
    gsap.fromTo(el, { opacity: 0, y: 12 }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay: 0.7,
      ease: "power3.out",
    });

    // Calculate vertical offset: how far the section center is from viewport center
    // when the section is pinned at top (parallax behavior)
    const getOffset = () => {
      const sectionH = howItWorks.offsetHeight;
      const viewportH = window.innerHeight;
      // When pinned, section top = 0, so section center = sectionH/2
      // Card is at viewportH/2, so offset = sectionH/2 - viewportH/2
      return sectionH / 2 - viewportH / 2;
    };

    // Scrub card from viewport center to section center
    gsap.to(inner, {
      y: () => getOffset(),
      ease: "none",
      scrollTrigger: {
        trigger: howItWorks,
        start: "top 80%",
        end: "top 20%",
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      ref={ref}
      data-fixed-visual
      className="fixed top-0 h-screen hidden lg:flex items-center justify-center pr-16 pointer-events-none opacity-0"
      style={{ zIndex: 40, width: "700px", right: "max(0px, calc((100vw - 1920px) / 2))" }}
    >
      <div ref={innerRef} className="pointer-events-auto">
        <RoundUpVisual />
      </div>
    </div>
  );
}
