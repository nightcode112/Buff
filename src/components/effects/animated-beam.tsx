"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";

export function AnimatedBeam() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="hidden lg:block absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-0 px-[60px]">
      <svg
        className="w-full h-4"
        viewBox="0 0 1000 20"
        preserveAspectRatio="none"
        fill="none"
      >
        <line
          x1="0"
          y1="10"
          x2="1000"
          y2="10"
          stroke="url(#beam-gradient)"
          strokeWidth="1"
          strokeDasharray="1000"
          strokeDashoffset={isInView ? "0" : "1000"}
          style={{
            transition: "stroke-dashoffset 2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
        {/* Dots at each step */}
        {[0, 333, 666, 1000].map((cx, i) => (
          <circle
            key={i}
            cx={cx}
            cy="10"
            r="3"
            fill="#3b82f6"
            opacity={isInView ? 0.5 : 0}
            style={{
              transition: `opacity 0.5s ease ${0.5 + i * 0.3}s`,
            }}
          />
        ))}
        <defs>
          <linearGradient id="beam-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
            <stop offset="50%" stopColor="rgba(59,130,246,0.1)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0.2)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
