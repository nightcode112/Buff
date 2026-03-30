"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Developers } from "@/components/developers";
import { AgentTabsProvider, AgentTabsTriggers, AgentTabsContent } from "@/components/agent-tabs";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    title: "Human or agent transacts",
    description:
      "A user swaps tokens, an AI agent calls an API, or a bot sends a payment — any onchain action. Buff hooks into the transaction lifecycle silently.",
  },
  {
    num: "02",
    title: "Fee gets rounded up",
    description:
      "The gas fee is rounded up to the nearest dollar (or configurable threshold). The difference is captured automatically.",
  },
  {
    num: "03",
    title: "Spare change gets invested",
    description:
      "The round-up difference is auto-invested into crypto assets — ETH, BTC, SOL, or a custom mix. Portfolio grows with every tx.",
  },
  {
    num: "04",
    title: "Portfolio compounds",
    description:
      "Users build a diversified crypto portfolio passively. Fully withdrawable, fully transparent, fully onchain. Every tx counts.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [activeStep, setActiveStep] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const wordAgentsRef = useRef<HTMLSpanElement>(null);
  const wordDevsRef = useRef<HTMLSpanElement>(null);
  const hStripRef = useRef<HTMLDivElement>(null);
  const agentTabsRef = useRef<HTMLDivElement>(null);
  const agentContentRef = useRef<HTMLDivElement>(null);
  const tabsLayerRef = useRef<HTMLDivElement>(null);
  const devPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    const hStrip = hStripRef.current;
    if (!section || !panel || !hStrip) return;

    const items = gsap.utils.toArray<HTMLElement>(
      panel.querySelectorAll(".step-item")
    );

    gsap.set(items[0], { opacity: 1, y: 0 });

    const showStep = (index: number) => {
      if (index === activeRef.current) return;
      const prev = items[activeRef.current];
      const next = items[index];
      const goingForward = index > activeRef.current;
      activeRef.current = index;
      setActiveStep(index);

      // Kill any running tweens on all items to prevent flicker
      items.forEach((item) => gsap.killTweensOf(item));

      gsap.to(prev, {
        opacity: 0,
        y: goingForward ? -20 : 20,
        duration: 0.35,
        ease: "power2.in",
        overwrite: true,
      });
      gsap.fromTo(next,
        { opacity: 0, y: goingForward ? 30 : -30 },
        { opacity: 1, y: 0, duration: 0.35, delay: 0.15, ease: "power2.out", overwrite: true },
      );
    };

    // Calculate horizontal scroll distance to center the dev panel
    const getStripScroll = () => {
      const devPanel = devPanelRef.current;
      if (!devPanel) return window.innerWidth;
      const panelWidth = devPanel.offsetWidth;
      // Move from 100vw to centered
      return window.innerWidth - (window.innerWidth - panelWidth) / 2;
    };

    // Phases
    const stepsVH = items.length;
    const outroVH = stepsVH;
    const tabsVH = outroVH + 1;
    const swapVH = tabsVH + 1;
    const hScrollStart = swapVH + 1;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    // Total scroll distance
    const totalScroll = isDesktop
      ? hScrollStart * window.innerHeight + getStripScroll()
      : hScrollStart * window.innerHeight;
    const vh = window.innerHeight;

    // Phase boundaries as fractions of total scroll
    const stepEnd = (stepsVH * vh) / totalScroll;
    const outroEnd = ((outroVH + 1) * vh) / totalScroll;
    const tabsEnd = ((tabsVH + 1) * vh) / totalScroll;
    const swapEnd = ((swapVH + 1) * vh) / totalScroll;
    const hScrollFraction = (hScrollStart * vh) / totalScroll;

    let currentPhase = -1;
    let outroShown = false;
    let tabsShown = false;
    let devShown = false;

    const showOutro = () => {
      if (outroShown) return;
      outroShown = true;
      gsap.to(contentRef.current, { opacity: 0, duration: 0.4, ease: "power2.in" });
      gsap.to(bottomBarRef.current, { opacity: 0, duration: 0.4, ease: "power2.in" });
      const fixedCard = document.querySelector("[data-fixed-visual]");
      if (fixedCard) gsap.to(fixedCard, { opacity: 0, duration: 0.4, ease: "power2.in" });
      gsap.fromTo(outroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power2.out" },
      );
    };

    const hideOutro = () => {
      outroShown = false;
      gsap.to(outroRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" });
      gsap.to(contentRef.current, { opacity: 1, duration: 0.4, delay: 0.1, ease: "power2.out" });
      gsap.to(bottomBarRef.current, { opacity: 1, duration: 0.4, delay: 0.1, ease: "power2.out" });
      const fixedCard = document.querySelector("[data-fixed-visual]");
      if (fixedCard) gsap.to(fixedCard, { opacity: 1, duration: 0.4, delay: 0.1, ease: "power2.out" });
      showStep(items.length - 1);
    };

    // Single pin with progress-based phase handling
    const pinST = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${totalScroll}`,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        const p = self.progress;
        const scrollPx = p * totalScroll;

        // Determine which phase we're in
        let newPhase: number;
        if (p < stepEnd) newPhase = 0;
        else if (p < outroEnd) newPhase = 1;
        else if (p < tabsEnd) newPhase = 2;
        else if (p < swapEnd) newPhase = 3;
        else newPhase = 4;

        if (newPhase !== currentPhase) {
          const prevPhase = currentPhase;
          const fixedCard = document.querySelector("[data-fixed-visual]");

          // Kill running tweens to prevent overlap
          gsap.killTweensOf([contentRef.current, bottomBarRef.current, outroRef.current, agentTabsRef.current, agentContentRef.current, wordAgentsRef.current, wordDevsRef.current]);
          if (fixedCard) gsap.killTweensOf(fixedCard);

          const isAdjacent = Math.abs(newPhase - prevPhase) === 1;
          const dur = 0.4;
          const fastDur = 0.3;
          const ease = "power2.out";
          const easeIn = "power2.in";

          if (!isAdjacent || prevPhase === -1) {
            // Non-adjacent jump or initial — instant set
            gsap.set(contentRef.current, { opacity: 0 });
            gsap.set(bottomBarRef.current, { opacity: 0 });
            gsap.set(outroRef.current, { opacity: 0 });
            gsap.set(agentTabsRef.current, { opacity: 0 });
            gsap.set(agentContentRef.current, { opacity: 0 });
            gsap.set(wordAgentsRef.current, { opacity: 0, y: 0 });
            gsap.set(wordDevsRef.current, { opacity: 0, y: 0 });

            if (newPhase === 0) {
              gsap.set(contentRef.current, { opacity: 1 });
              gsap.set(bottomBarRef.current, { opacity: 1 });
              if (fixedCard) gsap.set(fixedCard, { opacity: 1 });
            } else if (newPhase === 1) {
              gsap.set(outroRef.current, { opacity: 1 });
              gsap.set(wordAgentsRef.current, { opacity: 1 });
              if (fixedCard) gsap.set(fixedCard, { opacity: 0 });
            } else if (newPhase === 2) {
              gsap.set(outroRef.current, { opacity: 1 });
              gsap.set(wordAgentsRef.current, { opacity: 1 });
              gsap.set(agentTabsRef.current, { opacity: 1, y: 0 });
              gsap.set(agentContentRef.current, { opacity: 1, y: 0 });
              if (fixedCard) gsap.set(fixedCard, { opacity: 0 });
            } else if (newPhase >= 3) {
              gsap.set(outroRef.current, { opacity: 1 });
              gsap.set(wordDevsRef.current, { opacity: 1 });
              gsap.set(agentTabsRef.current, { opacity: 1, y: 0 });
              gsap.set(agentContentRef.current, { opacity: 1, y: 0 });
              if (fixedCard) gsap.set(fixedCard, { opacity: 0 });
            }
          } else {
            // Adjacent transition — smooth animations

            // Phase 0 → 1: Steps fade out, Outro fades in
            if (prevPhase === 0 && newPhase === 1) {
              gsap.to(contentRef.current, { opacity: 0, duration: dur, ease: easeIn });
              gsap.to(bottomBarRef.current, { opacity: 0, duration: dur, ease: easeIn });
              if (fixedCard) gsap.to(fixedCard, { opacity: 0, duration: dur, ease: easeIn });
              gsap.fromTo(outroRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: dur, delay: 0.15, ease });
              gsap.fromTo(wordAgentsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: dur, delay: 0.15, ease });
            }

            // Phase 1 → 0: Outro fades out, Steps fade in
            if (prevPhase === 1 && newPhase === 0) {
              gsap.to(outroRef.current, { opacity: 0, duration: fastDur, ease: easeIn });
              gsap.to(wordAgentsRef.current, { opacity: 0, duration: fastDur, ease: easeIn });
              gsap.to(contentRef.current, { opacity: 1, duration: dur, delay: 0.1, ease });
              gsap.to(bottomBarRef.current, { opacity: 1, duration: dur, delay: 0.1, ease });
              if (fixedCard) gsap.to(fixedCard, { opacity: 1, duration: dur, delay: 0.1, ease });
              showStep(items.length - 1);
            }

            // Phase 1 → 2: Tabs slide in
            if (prevPhase === 1 && newPhase === 2) {
              gsap.fromTo(agentTabsRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: dur, ease });
              gsap.fromTo(agentContentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: dur, ease });
            }

            // Phase 2 → 1: Tabs slide out
            if (prevPhase === 2 && newPhase === 1) {
              gsap.to(agentTabsRef.current, { opacity: 0, y: -20, duration: fastDur, ease: easeIn });
              gsap.to(agentContentRef.current, { opacity: 0, y: 20, duration: fastDur, ease: easeIn });
            }

            // Phase 2 → 3: Swap "AI agents" → "developers"
            if (prevPhase === 2 && newPhase === 3) {
              gsap.to(wordAgentsRef.current, { opacity: 0, y: -20, duration: fastDur, ease: easeIn });
              gsap.fromTo(wordDevsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: dur, delay: 0.15, ease });
            }

            // Phase 3 → 2: Swap "developers" → "AI agents"
            if (prevPhase === 3 && newPhase === 2) {
              gsap.to(wordDevsRef.current, { opacity: 0, y: 20, duration: fastDur, ease: easeIn });
              gsap.fromTo(wordAgentsRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: dur, delay: 0.15, ease });
            }

            // Phase 4 → 3: Reset h-scroll positions
            if (prevPhase === 4 && newPhase === 3 && isDesktop) {
              gsap.set(outroRef.current, { x: 0 });
              gsap.set(tabsLayerRef.current, { x: 0 });
              gsap.set(hStrip, { x: 0 });
            }
          }

          outroShown = newPhase >= 1;
          tabsShown = newPhase >= 2;
          devShown = newPhase >= 3;
          currentPhase = newPhase;
        }

        // Within steps phase, handle step index changes
        if (currentPhase === 0) {
          const stepIndex = Math.min(Math.floor(scrollPx / vh), items.length - 1);
          if (stepIndex !== activeRef.current) {
            showStep(stepIndex);
          }
        }

        // H-scroll phase: drive horizontal movement from progress
        if (currentPhase === 4 && isDesktop) {
          const hProgress = (p - hScrollFraction) / (1 - hScrollFraction);
          const clampedP = Math.max(0, Math.min(1, hProgress));
          const stripScroll = getStripScroll();
          gsap.set(outroRef.current, { x: -clampedP * stripScroll });
          gsap.set(tabsLayerRef.current, { x: -clampedP * stripScroll });
          gsap.set(hStrip, { x: -clampedP * stripScroll });
        } else if (isDesktop) {
          // Reset h-scroll position when not in phase 4
          gsap.set(outroRef.current, { x: 0 });
          gsap.set(tabsLayerRef.current, { x: 0 });
          gsap.set(hStrip, { x: 0 });
        }
      },
    });

    // Horizontal scroll — desktop only, driven by pin progress
    if (isDesktop) {
      gsap.set(hStrip, { opacity: 1 });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative" style={{ zIndex: 2 }}>
      {/* Scan lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      <div ref={panelRef} className="h-screen flex flex-col justify-center relative overflow-hidden">
        {/* Main content */}
        <div ref={contentRef} className="mx-auto px-6 lg:px-16 max-w-[1920px] w-full">
          <div className="lg:pr-[640px] xl:pr-[720px]">
            <div className="mb-10">
              <h2 className="text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] font-bold tracking-[-0.03em]">
                Every gas fee
                <br />
                builds a portfolio
              </h2>
            </div>

            <div className="relative min-h-[160px] sm:min-h-[180px]">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="step-item absolute top-0 left-0 right-0 opacity-0"
                >
                  <div className="mb-3">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-[0.3em] font-light">
                      Step {step.num}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[clamp(1rem,2.5vw,1.25rem)] text-muted-foreground leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AgentTabsProvider>
          {/* Outro headline — left side */}
          <div ref={outroRef} className="absolute inset-0 opacity-0 pointer-events-none">
            <div className="absolute inset-0 flex items-start pt-40 sm:pt-48 lg:pt-0 lg:items-center">
              <div className="mx-auto px-6 lg:px-16 max-w-[1920px] w-full">
                <div>
                  <h2 className="text-[clamp(2rem,8vw,6rem)] leading-[0.9] font-bold tracking-[-0.03em] lg:whitespace-nowrap">
                    Optimized for{" "}
                    <span className="relative inline-block">
                      <span ref={wordAgentsRef}>AI agents</span>
                      <span ref={wordDevsRef} className="absolute left-0 top-0 opacity-0">developers</span>
                    </span>
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs + content — right side, independent of outro opacity */}
          <div ref={tabsLayerRef} className="absolute inset-0 flex items-end lg:items-center pointer-events-none will-change-transform pb-20 lg:pb-0" style={{ zIndex: 10 }}>
            <div className="mx-auto px-6 lg:px-16 max-w-[1920px] w-full">
              <div className="flex justify-end">
                <div className="pointer-events-auto flex flex-col gap-4 w-full lg:w-[500px]">
                  <div ref={agentTabsRef} className="opacity-0">
                    <AgentTabsTriggers />
                  </div>
                  <div ref={agentContentRef} className="opacity-0">
                    <AgentTabsContent />
                    <div className="mt-6 flex justify-center">
                      <a
                        href="/docs/guides/skills"
                        className="inline-flex items-center justify-center gap-1.5 h-12 lg:h-14 px-6 lg:px-8 text-base lg:text-lg font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all"
                      >
                        SKILL.md
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AgentTabsProvider>

        {/* Horizontal scroll strip — desktop only */}
        <div
          ref={hStripRef}
          className="hidden lg:flex absolute top-0 h-full items-center will-change-transform"
          style={{ left: "100vw" }}
        >
          <div ref={devPanelRef} className="shrink-0 h-full flex items-center">
            <Developers />
          </div>
        </div>

        {/* Bottom bar */}
        <div ref={bottomBarRef} className="absolute bottom-4 sm:bottom-8 left-0 right-0 px-6 lg:px-16 max-w-[1920px] mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <span className="text-sm lg:text-2xl tabular-nums font-bold leading-tight text-muted-foreground font-mono">
                {String(activeStep + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-[3px]">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className={`block h-[3px] rounded-full transition-all duration-500 ease-in-out ${i === activeStep
                        ? "w-[40px] sm:w-[67px] bg-foreground"
                        : "w-[12px] sm:w-[20px] bg-foreground/10"
                      }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-light">
              Scroll
            </span>
          </div>
        </div>

      </div>

      {/* Mobile — inline Developers section */}
      <div className="lg:hidden">
        <Developers />
      </div>
    </section>
  );
}
