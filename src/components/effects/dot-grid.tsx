"use client";

import { useRef, useCallback } from "react";

export function DotGrid() {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 pointer-events-auto overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle 1.5px, rgba(212,175,55,0.15) 100%, transparent 100%)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 300px 300px at var(--mx, -999px) var(--my, -999px), black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 300px 300px at var(--mx, -999px) var(--my, -999px), black 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle 1px, rgba(240,236,227,0.5) 100%, transparent 100%)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
