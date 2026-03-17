"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0, my = 0;
    let tx = 0, ty = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest("a, button, [role=button], .btn-gold, .btn-outline-luxury, .premium-card, .glass-hover, .chain-pill, .shine-on-hover");
      if (cursorRef.current) {
        if (isInteractive) {
          cursorRef.current.style.width = "40px";
          cursorRef.current.style.height = "40px";
          cursorRef.current.style.transform = `translate(${mx - 20}px, ${my - 20}px)`;
          cursorRef.current.style.background = "rgba(212,175,55,0.1)";
          cursorRef.current.style.borderColor = "rgba(212,175,55,0.4)";
        } else {
          cursorRef.current.style.width = "8px";
          cursorRef.current.style.height = "8px";
          cursorRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
          cursorRef.current.style.background = "rgba(212,175,55,0.8)";
          cursorRef.current.style.borderColor = "transparent";
        }
      }
    };

    const animate = () => {
      tx += (mx - tx) * 0.08;
      ty += (my - ty) * 0.08;
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${tx - 16}px, ${ty - 16}px)`;
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    const rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Trail */}
      <div
        ref={trailRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-gold/20 pointer-events-none z-[9998] hidden md:block"
        style={{ transition: "width 0.3s, height 0.3s, border-color 0.3s" }}
      />
      {/* Dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-gold/80 pointer-events-none z-[9998] hidden md:block"
        style={{ transition: "width 0.2s, height 0.2s, background 0.2s, border-color 0.2s" }}
      />
    </>
  );
}
