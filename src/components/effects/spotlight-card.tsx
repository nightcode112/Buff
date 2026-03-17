"use client";

import { useRef, useCallback, type ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(59,130,246,0.08)",
  spotlightSize = 200,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      ref.current.style.setProperty("--sx", `${e.clientX - rect.left}px`);
      ref.current.style.setProperty("--sy", `${e.clientY - rect.top}px`);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty("--sx", "-999px");
    ref.current.style.setProperty("--sy", "-999px");
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(${spotlightSize}px circle at var(--sx, -999px) var(--sy, -999px), ${spotlightColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
