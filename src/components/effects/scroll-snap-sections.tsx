"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps children and applies scroll-snap behavior between
 * the first section (hero) and the second section (features).
 * Detects small scroll past the hero and snaps to the next section.
 */
export function ScrollSnapSections({ children }: { children: React.ReactNode }) {
  const isSnapping = useRef(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const heroEl = document.getElementById("hero");
    const featuresEl = document.getElementById("features");
    if (!heroEl || !featuresEl) return;

    let timeout: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      if (isSnapping.current) return;

      const scrollY = window.scrollY;
      const heroBottom = heroEl.offsetTop + heroEl.offsetHeight;
      const direction = scrollY > lastScroll.current ? "down" : "up";
      lastScroll.current = scrollY;

      // If user is in the transition zone between hero and features
      const transitionStart = heroBottom - 100;
      const transitionEnd = heroBottom + 200;

      if (scrollY > transitionStart && scrollY < transitionEnd) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          isSnapping.current = true;

          const target = direction === "down" ? featuresEl : heroEl;
          target.scrollIntoView({ behavior: "smooth" });

          // Release snap lock after animation
          setTimeout(() => {
            isSnapping.current = false;
          }, 800);
        }, 50);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, []);

  return <>{children}</>;
}
