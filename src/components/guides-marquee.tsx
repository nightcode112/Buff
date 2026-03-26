"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const guides = [
  { title: "Quick Start", desc: "Get Buff running in your app in under 5 minutes.", gradient: "from-[#1a1040] to-[#0d0825]", href: "/docs/quickstart" },
  { title: "Round-Ups", desc: "How round-ups work and how to configure them.", gradient: "from-[#0d1f3c] to-[#091428]", href: "/docs/round-ups" },
  { title: "Agent Wallets", desc: "Derive deterministic wallets from agent signatures.", gradient: "from-[#111] to-[#1a1a2e]", href: "/docs/wallet" },
  { title: "x402 Middleware", desc: "Auto round-up HTTP 402 payments for AI agents.", gradient: "from-[#1c0a2e] to-[#0f0618]", href: "/docs/guides/x402" },
  { title: "React Guide", desc: "Integrate Buff into your React application.", gradient: "from-[#0a1628] to-[#0d1f3c]", href: "/docs/guides/react" },
  { title: "AI Agents", desc: "Build autonomous agents that invest spare change.", gradient: "from-[#1a0d30] to-[#0d0620]", href: "/docs/guides/agents" },
  { title: "SKILL.md", desc: "Let AI agents discover and use Buff automatically.", gradient: "from-[#0d1825] to-[#091020]", href: "/docs/guides/skills" },
  { title: "Plans & Tiers", desc: "Round-up increments from $0.05 to $1.00.", gradient: "from-[#151030] to-[#0a0818]", href: "/docs/plans" },
];

export function GuidesMarquee() {
  return (
    <div className="py-8 sm:py-16">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 items-stretch">
          {guides.map((guide, i) => (
            <CarouselItem
              key={guide.title}
              className="pl-4 basis-[85%] sm:basis-[70%] min-w-[260px] sm:min-w-[300px] max-w-[460px] flex"
            >
              <a href={guide.href} className="group block w-full">
                <div className="bg-[#00000008] dark:bg-[#ffffff06] hover:bg-[#00000012] dark:hover:bg-[#ffffff0a] active:bg-[#00000018] dark:active:bg-[#ffffff0d] rounded-3xl sm:rounded-[48px] p-4 sm:p-5 flex flex-col gap-3 h-full transition-colors duration-200 cursor-grab">
                  <div className={`w-full aspect-[4/3] rounded-xl sm:rounded-[2rem] bg-gradient-to-br ${guide.gradient} flex items-center justify-center overflow-hidden`}>
                    <span className="text-4xl text-muted-foreground/10 font-mono group-hover:text-[#00ffaa]/20 transition-colors duration-500">{"</>"}</span>
                  </div>
                  <div className="flex flex-col gap-1 px-4 pb-2 text-left">
                    <h4 className="text-base font-bold">{guide.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{guide.desc}</p>
                  </div>
                </div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
