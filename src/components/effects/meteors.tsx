"use client";

import { useEffect, useState } from "react";

interface Meteor {
  id: number;
  top: string;
  left: string;
  delay: string;
  duration: string;
  size: number;
}

export function Meteors({ count = 6 }: { count?: number }) {
  const [meteors, setMeteors] = useState<Meteor[]>([]);

  useEffect(() => {
    const m: Meteor[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      top: `${Math.random() * 50}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${1.5 + Math.random() * 2}s`,
      size: 1 + Math.random() * 1.5,
    }));
    setMeteors(m);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {meteors.map((m) => (
        <div
          key={m.id}
          className="absolute animate-meteor"
          style={{
            top: m.top,
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: `${m.size}px`,
              height: `${m.size}px`,
              background: "#3b82f6",
              boxShadow: `0 0 ${m.size * 4}px rgba(59,130,246,0.4), 0 0 ${m.size * 8}px rgba(59,130,246,0.2)`,
            }}
          />
          <div
            className="absolute top-0 right-full"
            style={{
              width: `${60 + Math.random() * 80}px`,
              height: `${m.size}px`,
              background: `linear-gradient(to left, rgba(59,130,246,0.4), transparent)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
