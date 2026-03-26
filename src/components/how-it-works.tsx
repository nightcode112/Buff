"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Developers } from "@/components/developers";
import { AgentTabsProvider, AgentTabsTriggers, AgentTabsContent } from "@/components/agent-tabs";

gsap.registerPlugin(ScrollTrigger, Observer, ScrollSmoother);

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

    // Pin
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${isDesktop ? hScrollStart * window.innerHeight + getStripScroll() : hScrollStart * window.innerHeight}`,
      pin: panel,
      pinSpacing: true,
    });

    // Step transitions via Observer — one scroll gesture = one step
    let animating = false;
    const smoother = ScrollSmoother.get();

    const stepObserver = Observer.create({
      target: section,
      type: "wheel,touch",
      wheelSpeed: -1,
      tolerance: 10,
      preventDefault: true,
      onUp: () => {
        if (animating) return;
        const next = activeRef.current + 1;
        if (next < items.length) {
          animating = true;
          showStep(next);
          setTimeout(() => { animating = false; }, 500);
        } else {
          // Past last step — unpause smoother and release
          stepObserver.disable();
          if (smoother) smoother.paused(false);
        }
      },
      onDown: () => {
        if (animating) return;
        const prev = activeRef.current - 1;
        if (prev >= 0) {
          animating = true;
          showStep(prev);
          setTimeout(() => { animating = false; }, 500);
        } else {
          // Before first step — unpause smoother and release
          stepObserver.disable();
          if (smoother) smoother.paused(false);
        }
      },
    });
    stepObserver.disable();

    // Enable observer and pause smoother when in steps zone
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `top+=${stepsVH * window.innerHeight} top`,
      onEnter: () => {
        stepObserver.enable();
        if (smoother) smoother.paused(true);
      },
      onLeave: () => {
        stepObserver.disable();
        if (smoother) smoother.paused(false);
      },
      onEnterBack: () => {
        // Reset visual state
        gsap.set(outroRef.current, { opacity: 0 });
        gsap.set(tabsLayerRef.current, { x: 0 });
        gsap.set(agentTabsRef.current, { opacity: 0 });
        gsap.set(agentContentRef.current, { opacity: 0 });
        gsap.set(contentRef.current, { opacity: 1 });
        gsap.set(bottomBarRef.current, { opacity: 1 });
        const fixedCard = document.querySelector("[data-fixed-visual]");
        if (fixedCard) gsap.set(fixedCard, { opacity: 1 });
        items.forEach((item, i) => {
          gsap.set(item, { opacity: i === items.length - 1 ? 1 : 0, y: 0 });
        });
        activeRef.current = items.length - 1;
        setActiveStep(items.length - 1);
        stepObserver.enable();
        if (smoother) smoother.paused(true);
      },
      onLeaveBack: () => {
        stepObserver.disable();
        if (smoother) smoother.paused(false);
      },
    });

    // Outro
    let outroShown = false;

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

    ScrollTrigger.create({
      trigger: section,
      start: () => `top+=${outroVH * window.innerHeight} top`,
      end: () => `top+=${(outroVH + 1) * window.innerHeight} top`,
      onEnter: showOutro,
      onEnterBack: hideOutro,
    });

    // Tabs fade in
    let tabsShown = false;

    ScrollTrigger.create({
      trigger: section,
      start: () => `top+=${tabsVH * window.innerHeight} top`,
      end: () => `top+=${(tabsVH + 1) * window.innerHeight} top`,
      onEnter: () => {
        if (tabsShown) return;
        tabsShown = true;
        gsap.fromTo(agentTabsRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        );
        gsap.fromTo(agentContentRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        );
      },
      onEnterBack: () => {
        tabsShown = true;
        gsap.to(agentTabsRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
        gsap.to(agentContentRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
      },
    });

    // Word swap
    let devShown = false;

    ScrollTrigger.create({
      trigger: section,
      start: () => `top+=${swapVH * window.innerHeight} top`,
      end: () => `top+=${(swapVH + 1) * window.innerHeight} top`,
      onEnter: () => {
        if (devShown) return;
        devShown = true;
        gsap.to(wordAgentsRef.current, { opacity: 0, y: -20, duration: 0.3, ease: "power2.in" });
        gsap.fromTo(wordDevsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, delay: 0.15, ease: "power2.out" },
        );
      },
      onEnterBack: () => {
        devShown = false;
        if (isDesktop) {
          gsap.set(hStrip, { x: 0, opacity: 0 });
          gsap.set(outroRef.current, { opacity: 1 });
        }
        gsap.to(wordDevsRef.current, { opacity: 0, y: 20, duration: 0.3, ease: "power2.in" });
        gsap.fromTo(wordAgentsRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.3, delay: 0.15, ease: "power2.out" },
        );
      },
    });

    // Horizontal scroll — desktop only
    if (isDesktop) {
      const scrollConfig = {
        trigger: section,
        start: () => `top+=${hScrollStart * window.innerHeight} top`,
        end: () => `top+=${hScrollStart * window.innerHeight + getStripScroll()} top`,
        scrub: true,
        invalidateOnRefresh: true,
      };

      gsap.to(outroRef.current, {
        x: () => -getStripScroll(),
        ease: "none",
        scrollTrigger: scrollConfig,
      });

      gsap.to(tabsLayerRef.current, {
        x: () => -getStripScroll(),
        ease: "none",
        scrollTrigger: { ...scrollConfig },
      });

      gsap.set(hStrip, { opacity: 1 });
      gsap.to(hStrip, {
        x: () => -getStripScroll(),
        ease: "none",
        scrollTrigger: { ...scrollConfig },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative overflow-hidden" style={{ zIndex: 2 }}>
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
