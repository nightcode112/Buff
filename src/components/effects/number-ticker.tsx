"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useSpring, useTransform, motion } from "framer-motion";

interface NumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}

export function NumberTicker({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  duration = 2,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasStarted, setHasStarted] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (v) =>
    `${prefix}${Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(v)}${suffix}`
  );

  useEffect(() => {
    if (isInView && !hasStarted) {
      spring.set(value);
      setHasStarted(true);
    }
  }, [isInView, hasStarted, spring, value]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
