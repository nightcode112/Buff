"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
  type MotionValue,
} from "framer-motion";

// ── Shopify Editions exact easings ─────────────────────────────────────
// From their CSS: cubic-bezier(.25,.46,.45,.94) for fade-out/fade-in
// cubic-bezier(.41,.19,.13,.95) for scroll-state transitions
// cubic-bezier(.72,.16,.19,.96) for slide transitions

const EASE_FADE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const EASE_SCROLL: [number, number, number, number] = [0.41, 0.19, 0.13, 0.95];
const EASE_SLIDE: [number, number, number, number] = [0.72, 0.16, 0.19, 0.96];

const FADE_DURATION = 0.52; // --fade-out-duration
const FADE_DELAY = 0.2; // --fade-initial-delay
const SCROLL_DURATION = 0.6; // --scroll-state-duration
const STAGGER_FADE_DELAY = 0.075; // --stagger-fade-in-delay: 75ms
const SLIDE_DURATION = 0.6; // --slide-duration

// ── Fade In (Shopify-style: pure opacity, no translateY) ───────────────

function FadeIn({
  children,
  delay = FADE_DELAY,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "p" | "span" | "h1" | "h2" | "h3";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: FADE_DURATION, delay, ease: EASE_FADE }}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger Fade In (Shopify sidebar-style: 75ms stagger, 0.6s duration) ──

function StaggerFadeIn({
  children,
  className = "",
  staggerDelay = STAGGER_FADE_DELAY,
}: {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{
            duration: SCROLL_DURATION,
            delay: i * staggerDelay,
            ease: EASE_SCROLL,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// ── Slide In (Shopify slide-style: translateY + opacity) ───────────────

function SlideIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: SLIDE_DURATION, delay, ease: EASE_SLIDE }}
    >
      {children}
    </motion.div>
  );
}

// ── Timeline Start (Shopify 3D entrance: translate + rotateX + scale) ──

function TimelineEntrance({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ perspective: 1000 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 120, rotateX: -90, scale: 1.5 }}
        animate={inView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : {}}
        transition={{ duration: 0.75, delay, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ── Scale On Scroll (Shopify card-style: data-base-scale/opacity) ──────

function ScaleOnScroll({
  children,
  baseScale = 0.4,
  baseOpacity = 0.4,
  className = "",
}: {
  children: React.ReactNode;
  baseScale?: number;
  baseOpacity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [baseScale, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [baseOpacity, 1]);

  return (
    <motion.div ref={ref} style={{ scale, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

// ── Horizontal scroll section ──────────────────────────────────────────

function HorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);

  const cards = [
    { title: "AI Commerce", desc: "Intelligent storefronts that adapt to every customer in real-time.", color: "from-violet-600 to-indigo-600" },
    { title: "Unified Checkout", desc: "One-tap payments across every channel and currency.", color: "from-cyan-500 to-blue-600" },
    { title: "Global Operations", desc: "Inventory, shipping, and fulfillment orchestrated worldwide.", color: "from-emerald-500 to-teal-600" },
    { title: "Developer Platform", desc: "APIs, SDKs, and agent frameworks to build anything.", color: "from-orange-500 to-red-600" },
    { title: "Retail Reimagined", desc: "Hardware and software that blur the line between digital and physical.", color: "from-pink-500 to-rose-600" },
  ];

  return (
    <section ref={containerRef} className="relative h-[180vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-8 pl-16 pr-[40vw]">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className={`flex-shrink-0 w-[420px] h-[500px] rounded-3xl bg-gradient-to-br ${card.color} p-10 flex flex-col justify-end text-white`}
              whileHover={{ scale: 1.03, rotateY: 3 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h3 className="text-3xl font-bold mb-3">{card.title}</h3>
              <p className="text-lg text-white/80">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Sticky progress section ────────────────────────────────────────────

function StickyProgressVisual({ progress }: { progress: MotionValue<number> }) {
  const rotate = useTransform(progress, [0, 1], [0, 360]);
  const scale = useTransform(progress, [0, 0.5, 1], [0.5, 1, 0.7]);
  const borderRadius = useTransform(progress, [0, 0.5, 1], ["20%", "50%", "30%"]);

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="w-80 h-80 rounded-3xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-sm flex items-center justify-center"
        style={{ rotate }}
      >
        <motion.div
          className="w-40 h-40 bg-gradient-to-br from-violet-500 to-cyan-500"
          style={{ scale, borderRadius }}
        />
      </motion.div>
    </div>
  );
}

function StickyProgress() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const steps = [
    { label: "Design", detail: "Pixel-perfect themes with AI-assisted customization." },
    { label: "Build", detail: "Modular components and headless APIs for full control." },
    { label: "Launch", detail: "One-click deploy to 150+ countries with built-in compliance." },
    { label: "Scale", detail: "Auto-scaling infrastructure that handles flash sales effortlessly." },
  ];

  return (
    <section ref={containerRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen flex items-center">
        <div className="max-w-6xl mx-auto w-full px-8 grid grid-cols-2 gap-16">
          <div className="flex flex-col justify-center">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-white/10" />
              <motion.div
                className="absolute left-4 top-0 w-[2px] bg-white origin-top"
                style={{ scaleY: smoothProgress, height: "100%" }}
              />
              <div className="space-y-16 relative">
                {steps.map((step, i) => {
                  const start = i / steps.length;
                  const end = (i + 0.5) / steps.length;
                  return (
                    <StepItem key={i} step={step} progress={scrollYProgress} start={start} end={end} />
                  );
                })}
              </div>
            </div>
          </div>
          <StickyProgressVisual progress={smoothProgress} />
        </div>
      </div>
    </section>
  );
}

function StepItem({
  step,
  progress,
  start,
  end,
}: {
  step: { label: string; detail: string };
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const opacity = useTransform(progress, [start, end], [0.3, 1]);
  const x = useTransform(progress, [start, end], [-20, 0]);

  return (
    <motion.div className="pl-12" style={{ opacity, x }}>
      <h4 className="text-2xl font-bold text-white mb-2">{step.label}</h4>
      <p className="text-white/60">{step.detail}</p>
    </motion.div>
  );
}

// ── Staggered feature grid ─────────────────────────────────────────────

function FeatureGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: "⚡", title: "Lightning Fast", desc: "Sub-100ms responses globally" },
    { icon: "🛡️", title: "Secure by Default", desc: "End-to-end encryption on everything" },
    { icon: "🌐", title: "Global CDN", desc: "Edge-deployed in 300+ locations" },
    { icon: "🤖", title: "AI Native", desc: "Models built into every workflow" },
    { icon: "📊", title: "Real-time Analytics", desc: "Live dashboards and smart alerts" },
    { icon: "🔌", title: "Extensible", desc: "Plug in anything via open APIs" },
  ];

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((f, i) => (
        <motion.div
          key={i}
          className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-colors"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{
            duration: SCROLL_DURATION,
            delay: i * STAGGER_FADE_DELAY,
            ease: EASE_SCROLL,
          }}
          whileHover={{ y: -6, transition: { duration: 0.3 } }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-cyan-500/0 group-hover:from-violet-500/5 group-hover:to-cyan-500/10 transition-all duration-500" />
          <div className="relative">
            <span className="text-4xl mb-4 block">{f.icon}</span>
            <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-white/50 text-sm">{f.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Marquee / infinite scroll ──────────────────────────────────────────

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden py-4">
      <motion.div
        className="flex gap-8 whitespace-nowrap w-max"
        animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="text-5xl font-bold text-white/[0.07] select-none"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Counter animation ──────────────────────────────────────────────────

function AnimatedCounter({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => {
      setDisplay(v.toFixed(decimals));
    });
    return unsubscribe;
  }, [spring, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

function StatsRow() {
  const stats = [
    { value: 150, suffix: "+", label: "Countries", decimals: 0 },
    { value: 10, suffix: "M+", label: "Merchants", decimals: 0 },
    { value: 99.99, suffix: "%", label: "Uptime", decimals: 2 },
    { value: 875, suffix: "B", label: "GMV Processed", decimals: 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((s, i) => (
        <FadeIn key={i} delay={FADE_DELAY + i * STAGGER_FADE_DELAY}>
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">
              <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <div className="text-white/40 text-sm uppercase tracking-widest">{s.label}</div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

// ── Magnetic hover button ──────────────────────────────────────────────

function MagneticButton({ children }: { children: React.ReactNode }) {
  return (
    <motion.button
      className="relative px-8 py-4 rounded-full bg-white text-black font-semibold text-lg overflow-hidden group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <span className="relative z-10 group-hover:text-white transition-colors duration-300">
        {children}
      </span>
    </motion.button>
  );
}

// ── Text shimmer effect ────────────────────────────────────────────────

function ShimmerText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      <style>{`
        @keyframes shimmer-slide {
          0% { background-position: 200% 0%; }
          100% { background-position: -200% 0%; }
        }
        .shimmer-text {
          animation: shimmer-slide 4s linear infinite;
        }
      `}</style>
      <span
        className={`inline-block bg-clip-text text-transparent bg-[length:200%_100%] bg-gradient-to-r from-white via-white/40 to-white shimmer-text ${className}`}
      >
        {text}
      </span>
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────

export default function AnimationTestsPage() {
  return (
    <main className="bg-black text-white min-h-screen overflow-x-hidden">
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-gradient-text {
          background: linear-gradient(90deg, #a78bfa, #22d3ee, #a78bfa);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 4s ease infinite;
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[100px]"
          animate={{
            x: [0, -120, 80, 0],
            y: [0, 60, -100, 0],
            scale: [1, 0.8, 1.3, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 text-center max-w-5xl px-8">
          {/* Shopify-style: pure opacity fade, no translateY, 0.52s, cubic-bezier(.25,.46,.45,.94) */}
          <motion.p
            className="text-sm uppercase tracking-[0.3em] text-white/40 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: FADE_DURATION, delay: FADE_DELAY, ease: EASE_FADE }}
          >
            Animation Tests
          </motion.p>

          <h1 className="text-6xl md:text-8xl font-bold leading-[0.95] tracking-tight mb-8">
            {/* Shopify hero: fade-in with --fade-initial-delay + stagger between lines */}
            <motion.span
              className="block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: FADE_DURATION, delay: FADE_DELAY + 0.1, ease: EASE_FADE }}
            >
              Built for
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: FADE_DURATION, delay: FADE_DELAY + 0.2, ease: EASE_FADE }}
            >
              <span className="hero-gradient-text">the future.</span>
            </motion.span>
          </h1>

          <motion.p
            className="text-xl text-white/50 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: FADE_DURATION, delay: FADE_DELAY + 0.3, ease: EASE_FADE }}
          >
            A showcase of scroll-driven animations, parallax effects, and
            micro-interactions inspired by modern product pages.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: FADE_DURATION, delay: FADE_DELAY + 0.4, ease: EASE_FADE }}
          >
            <MagneticButton>Explore animations</MagneticButton>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 12, 0] }}
          transition={{
            opacity: { duration: FADE_DURATION, delay: FADE_DELAY + 0.5, ease: EASE_FADE },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 },
          }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-white/60"
              animate={{ y: [0, 16, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* ── Marquee ── */}
      <section className="py-8 border-y border-white/[0.06]">
        <Marquee items={["ANIMATIONS", "SCROLL", "PARALLAX", "MOTION", "TRANSITIONS", "EFFECTS"]} />
        <Marquee items={["FRAMER", "REACT", "SPRING", "EASING", "STAGGER", "REVEAL"]} reverse />
      </section>

      {/* ── Fade-in heading section (Shopify-style: pure opacity) ── */}
      <section className="py-32 px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              Every pixel crafted with intention. Every transition tuned for delight.
            </h2>
          </FadeIn>
          <FadeIn delay={FADE_DELAY + FADE_DURATION}>
            <p className="text-xl text-white/40 mt-8 max-w-2xl">
              Shopify Editions uses pure opacity fades — no translateY, no blur.
              Clean, fast, 0.52s with cubic-bezier(.25, .46, .45, .94).
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Stagger fade-in section (Shopify sidebar-style) ── */}
      <section className="py-24 px-8 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40 mb-4">Stagger Fade</p>
            <h2 className="text-4xl md:text-5xl font-bold">Items appear one by one.</h2>
          </FadeIn>
          <StaggerFadeIn className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "150+", label: "Countries" },
              { value: "10M+", label: "Merchants" },
              { value: "99.99%", label: "Uptime" },
              { value: "$875B", label: "GMV Processed" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-5xl font-bold text-white mb-2">{s.value}</div>
                <div className="text-white/40 text-sm uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </StaggerFadeIn>
        </div>
      </section>

      {/* ── Timeline entrance (Shopify 3D: translateY + rotateX + scale) ── */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Timeline Entrance</p>
          </FadeIn>
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold mb-16">
              3D perspective entrance from below.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Sidekick", "Checkout", "Operations"].map((title, i) => (
              <TimelineEntrance key={title} delay={i * 0.15}>
                <div className="h-[300px] rounded-2xl bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border border-white/[0.06] flex items-center justify-center">
                  <h3 className="text-2xl font-bold">{title}</h3>
                </div>
              </TimelineEntrance>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scale-on-scroll cards (Shopify data-base-scale/opacity style) ── */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Scale On Scroll</p>
          </FadeIn>
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold mb-16">
              Cards scale up as you scroll.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScaleOnScroll baseScale={0.4} baseOpacity={0.4}>
              <div className="h-[500px] rounded-3xl bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border border-white/[0.06] flex items-center justify-center">
                <span className="text-8xl">🎨</span>
              </div>
            </ScaleOnScroll>
            <ScaleOnScroll baseScale={0.5} baseOpacity={0.4}>
              <div className="h-[500px] rounded-3xl bg-gradient-to-br from-cyan-900/50 to-teal-900/50 border border-white/[0.06] flex items-center justify-center">
                <span className="text-8xl">🚀</span>
              </div>
            </ScaleOnScroll>
          </div>
        </div>
      </section>

      {/* ── Stagger fade grid (Shopify-style: 75ms stagger, pure opacity) ── */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Staggered Grid</p>
          </FadeIn>
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold mb-16">
              Features cascade into view.
            </h2>
          </FadeIn>
          <FeatureGrid />
        </div>
      </section>

      {/* ── Horizontal scroll ── */}
      <section>
        <div className="max-w-6xl mx-auto px-8 pt-32">
          <FadeIn className="mb-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Horizontal Scroll</p>
          </FadeIn>
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold">Cards that move with you.</h2>
          </FadeIn>
        </div>
        <div className="mt-16">
          <HorizontalScroll />
        </div>
      </section>

      {/* ── Sticky progress ── */}
      <section>
        <div className="max-w-6xl mx-auto px-8 pt-32 pb-16">
          <FadeIn className="mb-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Sticky Progress</p>
          </FadeIn>
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold">Step by step, driven by scroll.</h2>
          </FadeIn>
        </div>
        <StickyProgress />
      </section>

      {/* ── Slide In (Shopify slide-style: translateY + opacity) ── */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Slide Entrance</p>
          </FadeIn>
          <SlideIn>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Slide in with cubic-bezier(.72, .16, .19, .96).
            </h2>
          </SlideIn>
          <SlideIn delay={0.1}>
            <p className="text-xl text-white/40 mb-8 max-w-2xl">
              Used for content that enters after the initial fade, with a smooth
              deceleration curve.
            </p>
          </SlideIn>
          <SlideIn delay={0.2}>
            <MagneticButton>Get started</MagneticButton>
          </SlideIn>
        </div>
      </section>

      {/* ── Shimmer CTA ── */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40 mb-8">Shimmer Effect</p>
          </FadeIn>
          <FadeIn delay={FADE_DELAY + 0.1}>
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              <ShimmerText text="The future is animated." />
            </h2>
          </FadeIn>
          <FadeIn delay={FADE_DELAY + 0.2}>
            <p className="text-xl text-white/40 mb-12 max-w-xl mx-auto">
              Combine these primitives to create immersive, scroll-driven
              experiences that feel alive.
            </p>
          </FadeIn>
          <FadeIn delay={FADE_DELAY + 0.3}>
            <MagneticButton>Get started</MagneticButton>
          </FadeIn>
        </div>
      </section>

      <div className="h-32" />
    </main>
  );
}
