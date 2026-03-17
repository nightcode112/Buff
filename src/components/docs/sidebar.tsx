"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "Getting Started",
    items: [
      { label: "Introduction", href: "/docs" },
      { label: "Installation", href: "/docs/installation" },
      { label: "Quick Start", href: "/docs/quickstart" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { label: "How Round-Ups Work", href: "/docs/round-ups" },
      { label: "Plan Tiers", href: "/docs/plans" },
      { label: "Wallet Derivation", href: "/docs/wallet" },
      { label: "Accumulate & Invest", href: "/docs/accumulate" },
    ],
  },
  {
    title: "SDK Reference",
    items: [
      { label: "Buff.init()", href: "/docs/api/init" },
      { label: "buff.wrap()", href: "/docs/api/wrap" },
      { label: "buff.checkAndInvest()", href: "/docs/api/invest" },
      { label: "buff.getPortfolio()", href: "/docs/api/portfolio" },
      { label: "Events", href: "/docs/api/events" },
      { label: "Error Handling", href: "/docs/api/errors" },
    ],
  },
  {
    title: "REST API",
    items: [
      { label: "Endpoints", href: "/docs/api/rest" },
      { label: "Multi-Language Examples", href: "/docs/examples" },
    ],
  },
  {
    title: "SDK Languages",
    items: [
      { label: "Python", href: "/docs/sdk/python" },
      { label: "Rust", href: "/docs/sdk/rust" },
      { label: "Go", href: "/docs/sdk/go" },
    ],
  },
  {
    title: "Framework Guides",
    items: [
      { label: "React / Next.js", href: "/docs/guides/react" },
      { label: "Vue / Nuxt", href: "/docs/guides/vue" },
      { label: "Svelte / SvelteKit", href: "/docs/guides/svelte" },
      { label: "Vanilla JS", href: "/docs/guides/vanilla" },
    ],
  },
  {
    title: "Agents & Payments",
    items: [
      { label: "Agent Integration", href: "/docs/guides/agents" },
      { label: "x402 Protocol", href: "/docs/guides/x402" },
      { label: "Web2 Bridge", href: "/docs/guides/web2" },
    ],
  },
  {
    title: "Advanced",
    items: [
      { label: "Devnet Testing", href: "/docs/guides/devnet" },
      { label: "Custom Storage", href: "/docs/guides/storage" },
    ],
  },
  {
    title: "Components",
    items: [
      { label: "Drop-in Widgets", href: "/docs/components" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] shrink-0 h-[calc(100vh-72px)] sticky top-[72px] overflow-y-auto border-r border-border/30 bg-card py-8 px-5 hidden lg:block">
      <nav className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-2">
              {section.title}
            </h4>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block text-[14px] px-3 py-1.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "text-gold bg-gold/[0.06] border-l-2 border-gold font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
