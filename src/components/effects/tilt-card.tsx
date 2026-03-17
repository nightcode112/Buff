"use client";

import { useRef, useCallback, type ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
}

export function TiltCard({ children, className = "", tiltAmount = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      ref.current.style.transform = `perspective(800px) rotateY(${x * tiltAmount}deg) rotateX(${-y * tiltAmount}deg) scale3d(1.02,1.02,1.02)`;
    },
    [tiltAmount]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
