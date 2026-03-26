"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
  AnimatePresence,
} from "framer-motion";

// ── Shopify Editions exact timings & easings ───────────────────────────

const EASE_FADE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const EASE_SCROLL: [number, number, number, number] = [0.41, 0.19, 0.13, 0.95];
const EASE_SLIDE: [number, number, number, number] = [0.72, 0.16, 0.19, 0.96];

const FADE_DUR = 0.52;
const FADE_DELAY = 0.2;
const SCROLL_DUR = 0.6;
const STAGGER_DELAY = 0.075; // 75ms
const SLIDE_DUR = 0.6;

// ── Section data ───────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "sidekick",
    title: "Sidekick",
    desc: "The AI-powered Shopify expert who's just as obsessed with your business as you are.",
    color: "from-violet-600 to-indigo-900",
    products: [
      { title: "Insights, proactively delivered", desc: "Sidekick surfaces data-driven insights before you even ask, helping you spot trends and act on opportunities." },
      { title: "Complexity, delegated", desc: "Hand off multi-step workflows to Sidekick and let it handle the details while you focus on strategy." },
      { title: "Designs, refined", desc: "Get AI-powered suggestions to polish your storefront layout, copy, and visuals." },
    ],
  },
  {
    id: "agentic",
    title: "Agentic",
    desc: "Sell directly in AI chats with built-in tools that syndicate your products to every AI platform.",
    color: "from-cyan-600 to-blue-900",
    products: [
      { title: "Shopify Agentic Storefronts", desc: "Your entire catalog, discoverable and purchasable inside any AI assistant conversation." },
      { title: "AI discovery for headless stores", desc: "Surface your products through AI-powered search across every connected platform." },
    ],
  },
  {
    id: "online",
    title: "Online",
    desc: "Validate store changes with A/B testing and an AI tool that simulates shopping behavior.",
    color: "from-emerald-600 to-teal-900",
    products: [
      { title: "Test and time your launches with Rollouts", desc: "A/B test theme changes, schedule launches, and roll back instantly if needed." },
      { title: "Shopify SimGym app", desc: "Simulate shopper behavior with AI agents that use data from billions of purchases." },
      { title: "Introducing Tinker", desc: "A new AI-powered tool to quickly prototype and iterate on store customizations." },
    ],
  },
  {
    id: "retail",
    title: "Retail",
    desc: "New in-store hardware that provides unwavering reliability.",
    color: "from-orange-600 to-red-900",
    products: [
      { title: "Not your standard hub", desc: "Purpose-built hardware designed to keep your retail operations running smoothly." },
      { title: "Connections that never drop", desc: "Dual connectivity ensures your POS stays online even when networks falter." },
      { title: "The only hub with processing power", desc: "On-device processing means faster transactions and offline resilience." },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    desc: "Grow your sales with a first-of-its-kind product network.",
    color: "from-pink-600 to-rose-900",
    products: [
      { title: "Shopify Product Network", desc: "A discovery network that connects your products to high-intent buyers across the web." },
      { title: "Shop Campaigns expands to the online store", desc: "Run performance campaigns directly from your Shopify admin." },
      { title: "Shopify Messaging supports SMS marketing", desc: "Reach customers with targeted SMS campaigns built into your workflow." },
    ],
  },
  {
    id: "checkout",
    title: "Checkout",
    desc: "Convert customers with personalized checkout experiences and more payment options.",
    color: "from-amber-600 to-yellow-900",
    products: [
      { title: "Personalized Shop button", desc: "A checkout button that adapts to each customer for higher conversion." },
      { title: "Checkout customization per market", desc: "Tailor your checkout experience for each region and customer segment." },
      { title: "Shop Pay Installments in the UK", desc: "Offer flexible payment options to UK customers at checkout." },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    desc: "Manage inventory and automate workflows at scale.",
    color: "from-slate-600 to-gray-900",
    products: [
      { title: "Inventory management overhaul", desc: "A completely redesigned inventory system built for high-volume merchants." },
      { title: "Shopify Flow improvements", desc: "More triggers, actions, and templates to automate complex business logic." },
      { title: "Bin locations in Order Printer", desc: "Streamline warehouse picking with bin location support on printed orders." },
    ],
  },
  {
    id: "developer",
    title: "Developer",
    desc: "Build commerce agents, extend the platform, and ship faster with new APIs.",
    color: "from-green-600 to-emerald-900",
    products: [
      { title: "Build with full MCP support", desc: "Use the Model Context Protocol to build AI agents that interact with Shopify stores." },
      { title: "Build commerce agents from the dev dash", desc: "A new developer dashboard for creating, testing, and deploying commerce agents." },
      { title: "Binary testing in Shopify Functions", desc: "Test your Shopify Functions with binary inputs for faster iteration." },
    ],
  },
];

// ── Fade In ────────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = FADE_DELAY,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: FADE_DUR, delay, ease: EASE_FADE }}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger Fade ───────────────────────────────────────────────────────

function StaggerFade({
  children,
  className = "",
}: {
  children: React.ReactNode[];
  className?: string;
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
            duration: SCROLL_DUR,
            delay: i * STAGGER_DELAY,
            ease: EASE_SCROLL,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// ── SVG Title (Shopify uses SVG paths for the hero title) ──────────────

function SVGTitle() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="w-[55%] mb-8">
      <motion.h1
        className="headline-1 text-current"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: FADE_DUR, delay: FADE_DELAY, ease: EASE_FADE }}
      >
        <span className="block">The</span>
        <motion.span
          className="block"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: FADE_DUR, delay: FADE_DELAY + 0.1, ease: EASE_FADE }}
        >
          Renaissance
        </motion.span>
        <motion.span
          className="block"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: FADE_DUR, delay: FADE_DELAY + 0.2, ease: EASE_FADE }}
        >
          Edition
        </motion.span>
      </motion.h1>
    </div>
  );
}

// ── Davinci Lines (SVG border animation around sidebar) ────────────────

function DavinciLines({ active }: { active: boolean }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
      aria-hidden="true"
    >
      <motion.rect
        x="0" y="0" width="100%" height="100%"
        className="stroke-current fill-none"
        strokeWidth={1}
        pathLength={1}
        initial={{ strokeDasharray: "1", strokeDashoffset: "1", opacity: 0 }}
        animate={active ? { strokeDashoffset: 0, opacity: 0.3 } : {}}
        transition={{ duration: 3, ease: [0.34, 0.22, 0.47, 0.84] }}
      />
    </svg>
  );
}

// ── Product Card ───────────────────────────────────────────────────────

function ProductCard({
  product,
  index,
}: {
  product: { title: string; desc: string };
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.article
      ref={ref}
      className="w-full border-b border-white/[0.06] last:border-none"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{
        duration: SCROLL_DUR,
        delay: index * STAGGER_DELAY,
        ease: EASE_SCROLL,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] items-center py-[50px] md:py-[80px] px-[48px] md:px-[280px] lg:px-16">
        <div>
          <h3 className="headline-4 mb-[60px]">{product.title}</h3>
          <p className="narrative-3 text-white/60 mb-[60px]">{product.desc}</p>
          <button className="mt-0 inline-flex items-center gap-[20px] bodycopy-2 border border-white/20 rounded-[12px] px-[20px] py-[12px] hover:bg-white/10 transition-colors">
            Read help doc
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-60">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="aspect-video rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="opacity-40 ml-1">
              <path d="M23.4 11.65C23.67 11.81 23.67 12.19 23.4 12.35L6.6 22.05C6.33 22.2 6 22.01 6 21.7V2.3C6 1.99 6.33 1.8 6.6 1.95L23.4 11.65Z" />
            </svg>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ── Section Component ──────────────────────────────────────────────────

function EditionSection({
  section,
  isActive,
}: {
  section: (typeof SECTIONS)[number];
  isActive: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      ref={ref}
      id={section.id}
      className="relative min-h-screen text-white"
      data-section-id={section.id}
    >
      {/* Section hero */}
      <div className="min-h-[100svh] flex flex-col justify-end md:justify-center px-[48px] md:px-[280px] lg:px-16 py-[160px] md:py-[520px] snap-start">
        <FadeIn>
          <h2 className="headline-1 mb-[32px] transition-opacity duration-300">
            {section.title}
          </h2>
        </FadeIn>
        <FadeIn delay={FADE_DELAY + FADE_DUR}>
          <div className="lg:w-9/12 mb-[280px] lg:mb-[160px]">
            <p className="narrative-1">
              {section.desc}
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Product cards */}
      <div className="pb-[240px] md:pb-[320px]">
        {section.products.map((product, i) => (
          <ProductCard key={product.title} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────

function Sidebar({ activeSection }: { activeSection: string }) {
  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <aside className="fixed left-0 top-0 w-[20%] h-screen hidden lg:flex flex-col z-50 text-white">
      {/* Title area */}
      <div className="relative flex-1 flex flex-col justify-center p-8 border-r border-white/[0.06]">
        <SVGTitle />
        <p className="subtitle text-white/40 mt-[40px]">
          A new world of commerce.
          <br />
          150+ product updates.
        </p>
      </div>

      {/* Navigation */}
      <nav className="border-r border-t border-white/[0.06] py-4">
        <StaggerFade className="flex flex-col">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleClick(sec.id)}
              className={`text-left px-8 py-2 headline-6 transition-all duration-300 relative ${
                activeSection === sec.id
                  ? "text-white"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {activeSection === sec.id && (
                <motion.span
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-0 bottom-0 w-[2px] bg-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {sec.title}
            </button>
          ))}
        </StaggerFade>
      </nav>

      {/* Terms */}
      <div className="border-r border-t border-white/[0.06] px-8 py-4">
        <p className="text-[10px] text-white/20">
          Winter &apos;26 &middot; Privacy Policy
        </p>
      </div>
    </aside>
  );
}

// ── Mobile Nav ─────────────────────────────────────────────────────────

function MobileNav({ activeSection }: { activeSection: string }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-black/80 backdrop-blur-md border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-bold text-white">Editions Winter &apos;26</span>
        <span className="text-xs text-white/40 capitalize">{activeSection}</span>
      </div>
      <div className="flex overflow-x-auto gap-1 px-4 pb-2 scrollbar-none">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" })}
            className={`text-xs whitespace-nowrap px-3 py-1 rounded-full transition-colors ${
              activeSection === sec.id
                ? "bg-white text-black"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {sec.title}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── Hero Section (the 3D globe area) ───────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <motion.div
      ref={ref}
      className="relative h-[150vh] lg:ml-[20%] snap-start"
      style={{ opacity }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ scale, y }} className="text-center">
          {/* Globe placeholder */}
          <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] mx-auto mb-8">
            <motion.div
              className="absolute inset-0 rounded-full border border-white/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-[15%] rounded-full border border-white/[0.06]"
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-[30%] rounded-full border border-white/[0.04]"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            {/* Orbital dots */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/40"
                style={{
                  top: "50%",
                  left: "50%",
                }}
                animate={{
                  x: [
                    Math.cos((i / 5) * Math.PI * 2) * 150,
                    Math.cos((i / 5) * Math.PI * 2 + Math.PI) * 150,
                    Math.cos((i / 5) * Math.PI * 2) * 150,
                  ],
                  y: [
                    Math.sin((i / 5) * Math.PI * 2) * 150,
                    Math.sin((i / 5) * Math.PI * 2 + Math.PI) * 150,
                    Math.sin((i / 5) * Math.PI * 2) * 150,
                  ],
                  opacity: [0.6, 0.2, 0.6],
                }}
                transition={{
                  duration: 20 + i * 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
            {/* Center glow */}
            <div className="absolute inset-[35%] rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-xl" />
          </div>

          <motion.p
            className="text-sm uppercase tracking-[0.3em] text-white/30 mb-4 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: FADE_DUR, delay: FADE_DELAY, ease: EASE_FADE }}
          >
            Winter &apos;26
          </motion.p>
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: FADE_DUR, delay: FADE_DELAY + 0.1, ease: EASE_FADE }}
          >
            The Renaissance Edition
          </motion.h1>
          <motion.p
            className="text-white/40 mt-4 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: FADE_DUR, delay: FADE_DELAY + 0.2, ease: EASE_FADE }}
          >
            A new world of commerce. 150+ product updates.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{
              opacity: { duration: FADE_DUR, delay: 1, ease: EASE_FADE },
              y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
            }}
          >
            <div className="w-5 h-8 rounded-full border border-white/20 mx-auto flex justify-center pt-1.5">
              <motion.div
                className="w-1 h-1 rounded-full bg-white/50"
                animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function CloneTestPage() {
  const [activeSection, setActiveSection] = useState("sidekick");
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const id = entry.target.getAttribute("data-section-id");
            if (id) setActiveSection(id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll("[data-section-id]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-black text-white h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        /* Shopify exact typography — from tailwind-RwJOH0Un.css */

        /* headline-1: section titles (72px mobile → clamp on desktop) */
        .headline-1 {
          font-size: 72px;
          line-height: 0.9;
          font-weight: 700;
        }
        @media (min-width: 769px) {
          .headline-1 { font-size: clamp(7.5rem, 35.79px + 10.96vw, 13.75rem); }
        }

        /* headline-4: product card titles (32px) */
        .headline-4 {
          font-size: 32px;
          line-height: 0.95;
          font-weight: 700;
        }

        /* headline-6: sidebar nav items (18px) */
        .headline-6 {
          font-size: 18px;
          line-height: 0.95;
          font-weight: 700;
        }

        /* narrative-1: section descriptions (28px) */
        .narrative-1 {
          font-size: 28px;
          line-height: 0.96;
          font-weight: 400;
        }
        @media (min-width: 769px) {
          .narrative-1 { font-size: clamp(2rem, 18.53px + 1.75vw, 3rem); }
        }

        /* narrative-3: product card descriptions (20px) */
        .narrative-3 {
          font-size: 20px;
          line-height: 0.97;
          font-weight: 400;
        }

        /* bodycopy-1: body text (16px → 14px) */
        .bodycopy-1 {
          font-size: 16px;
          line-height: 1.1;
          font-weight: 700;
        }
        @media (min-width: 769px) {
          .bodycopy-1 { font-size: 14px; }
        }

        /* bodycopy-2: small text, CTAs (14px → 11px) */
        .bodycopy-2 {
          font-size: 14px;
          line-height: 1.1;
          font-weight: 700;
        }
        @media (min-width: 769px) {
          .bodycopy-2 { font-size: 11px; }
        }

        /* subtitle under hero title */
        .subtitle {
          font-size: 17px;
          line-height: 0.97;
          font-weight: 400;
        }


        /* Shopify spacing unit: --spacing = 0.25rem = 4px */
        /* px-12 = 48px, px-70 = 280px, py-40 = 160px, py-130 = 520px */
        /* mb-70 = 280px, mb-40 = 160px, mb-15 = 60px, mb-10 = 40px */
      `}</style>

      <Sidebar activeSection={activeSection} />
      <MobileNav activeSection={activeSection} />

      <main ref={mainRef}>
        {/* Hero with globe */}
        <HeroSection />

        {/* Content sections */}
        <div className="lg:ml-[20%]">
          {SECTIONS.map((section) => (
            <EditionSection
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="lg:ml-[20%] border-t border-white/[0.06] px-6 md:px-16 py-16 snap-start">
          <FadeIn>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <p className="text-sm font-bold mb-1">Shopify Editions</p>
                <p className="text-xs text-white/30">Winter &apos;26 — The Renaissance Edition</p>
              </div>
              <div className="flex gap-6 text-xs text-white/30">
                <span className="hover:text-white/60 transition-colors cursor-pointer">Terms of Service</span>
                <span className="hover:text-white/60 transition-colors cursor-pointer">Privacy Policy</span>
              </div>
            </div>
          </FadeIn>
        </footer>
      </main>
    </div>
  );
}
