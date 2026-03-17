"use client";

import { useEffect, useRef, useState } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    let x = 0, y = 0;
    let tx = 0, ty = 0;
    let raf: number;

    const handleMouseMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest(
        "a, button, [role=button], .btn-gold, .btn-outline-luxury, .premium-card, .glass-hover, .chain-pill, .shine-on-hover, .stat-card, .code-block, input, textarea, select"
      );
      setHovering(!!isInteractive);
    };

    const animate = () => {
      tx += (x - tx) * 0.12;
      ty += (y - ty) * 0.12;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 pointer-events-none z-[9997] hidden md:block"
      style={{ willChange: "transform" }}
    >
      {/* Outer glow ring */}
      <div
        className="rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
        style={{
          width: hovering ? "48px" : "24px",
          height: hovering ? "48px" : "24px",
          border: hovering
            ? "1.5px solid rgba(212, 175, 55, 0.35)"
            : "1px solid rgba(212, 175, 55, 0.1)",
          background: hovering
            ? "radial-gradient(circle, rgba(212, 175, 55, 0.06) 0%, transparent 70%)"
            : "transparent",
          boxShadow: hovering
            ? "0 0 20px rgba(212, 175, 55, 0.1), inset 0 0 12px rgba(212, 175, 55, 0.03)"
            : "none",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
