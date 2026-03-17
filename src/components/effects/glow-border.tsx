"use client";

import { type ReactNode } from "react";

interface GlowBorderProps {
  children: ReactNode;
  className?: string;
  borderRadius?: string;
}

export function GlowBorder({
  children,
  className = "",
  borderRadius = "1rem",
}: GlowBorderProps) {
  return (
    <div className={`relative group/glow ${className}`}>
      {/* Rotating gradient border */}
      <div
        className="absolute -inset-[1px] rounded-[inherit] opacity-0 group-hover/glow:opacity-100 transition-opacity duration-500 z-0"
        style={{
          borderRadius,
          background:
            "conic-gradient(from var(--glow-angle, 0deg), transparent 0%, rgba(59,130,246,0.3) 10%, transparent 20%, transparent 50%, rgba(16,185,129,0.2) 60%, transparent 70%)",
          animation: "glow-rotate 3s linear infinite",
        }}
      />
      {/* Inner content */}
      <div className="relative z-10" style={{ borderRadius }}>
        {children}
      </div>
    </div>
  );
}
