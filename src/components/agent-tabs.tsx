"use client";

import { useState, createContext, useContext } from "react";
import { Terminal, Lightning, Wallet } from "@phosphor-icons/react";

const tabs = [
  {
    id: "sdk",
    title: "Headless SDK",
    description: "No popups, no browser wallets. Just pass an API key and go.",
    code: "new Buff({ apiKey })",
    points: [
      { label: "Server-side ready", text: "Built for Node.js, Deno, and serverless environments." },
      { label: "No browser required", text: "Autonomous agents can transact without any UI." },
      { label: "One-line init", text: "new Buff({ apiKey }) — that's the entire setup." },
    ],
  },
  {
    id: "x402",
    title: "x402 Middleware",
    description: "Round up API payments automatically. Every HTTP 402 payment generates spare change.",
    code: "buff.calculateRoundUp(cost)",
    points: [
      { label: "Automatic capture", text: "Hooks into the payment lifecycle silently." },
      { label: "Configurable thresholds", text: "Round to nearest dollar, $5, or custom ceiling." },
      { label: "Zero UX friction", text: "Users and agents never notice the round-up." },
    ],
  },
  {
    id: "wallets",
    title: "Agent Wallets",
    description: "Programmatic, deterministic, and exportable. Derive wallets from agent IDs.",
    code: "buff.deriveWallet(signature)",
    points: [
      { label: "Deterministic derivation", text: "Same agent ID always produces the same wallet." },
      { label: "Non-custodial", text: "Users own their keys. No custody risk." },
      { label: "Fully exportable", text: "Move wallets between platforms freely." },
    ],
  },
];

const tabIcons = {
  sdk: Terminal,
  x402: Lightning,
  wallets: Wallet,
};

const TabsContext = createContext<{ active: string; setActive: (id: string) => void }>({
  active: tabs[0].id,
  setActive: () => {},
});

export function AgentTabsProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(tabs[0].id);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
}

export function AgentTabsTriggers() {
  const { active, setActive } = useContext(TabsContext);

  return (
    <div className="flex flex-wrap gap-1">
      {tabs.map((tab) => {
        const Icon = tabIcons[tab.id as keyof typeof tabIcons];
        return (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium cursor-pointer transition-all duration-300 rounded-full ${
              active === tab.id
                ? "bg-[#ffffff10] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} weight={active === tab.id ? "fill" : "regular"} className="shrink-0" />
            <span className="whitespace-nowrap">{tab.title}</span>
          </button>
        );
      })}
    </div>
  );
}

export function AgentTabsContent() {
  const { active } = useContext(TabsContext);

  return (
    <div className="w-full">
      <div className="bg-[#ffffff03] border border-[#ffffff06] rounded-t-[12px] rounded-b-[24px] sm:rounded-b-[32px] p-5 sm:p-8 lg:p-10">
        <div className="grid">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`col-start-1 row-start-1 transition-opacity duration-300 ${tab.id === active ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">
                {tab.description}
              </p>

              <div className="space-y-3 sm:space-y-4 mb-5">
                {tab.points.map((point, i) => (
                  <div key={point.label} className="flex items-start gap-2.5 sm:gap-3">
                    <span className="text-[10px] font-bold font-mono text-[#00ffaa] mt-0.5 sm:mt-1 shrink-0 w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold">{point.label}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{point.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#000000] border border-[#ffffff08] px-4 py-3 font-mono text-xs sm:text-sm text-[#00ffaa] overflow-x-auto">
                <span className="text-[#555]">{">"}</span> {tab.code}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
