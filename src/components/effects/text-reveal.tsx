"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ children, className = "", delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const words = children.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const wordEls = el.querySelectorAll<HTMLElement>(".text-reveal-word");

    gsap.set(wordEls, { y: "110%", opacity: 0 });

    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(wordEls, {
          y: "0%",
          opacity: 1,
          duration: 0.5,
          delay,
          stagger: 0.08,
          ease: "power3.out",
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [delay]);

  return (
    <span ref={ref} className={`inline ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-visible pb-[0.15em] mb-[-0.15em]">
          <span className="text-reveal-word inline-block">
            {word}
          </span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
