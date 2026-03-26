"use client";

import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Plans", href: "/docs/plans" },
      { label: "Simulator", href: "/simulator" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs", external: true },
      { label: "Quick Start", href: "/docs/quickstart", external: true },
      { label: "SDK Reference", href: "/docs/api/init", external: true },
      { label: "SKILL.md", href: "/docs/guides/skills" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "https://github.com/nightcode112/Buff", external: true },
    ],
  },
];

export function CTA() {
  return (
    <section className="relative pt-20 sm:pt-32 pb-10 min-h-screen flex flex-col justify-between">
      {/* Radial vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] hidden dark:block"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)",
        }}
      />
      {/* CTA — centered */}
      <div className="flex-1 flex items-center relative z-[2]">
        <div className="mx-auto px-6 lg:px-16 max-w-[1920px] w-full">
          <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] font-bold tracking-[-0.03em] mb-6">
            Start building.
          </h2>
          <p className="text-lg text-muted-foreground leading-snug mb-10 max-w-lg mx-auto">
            Free to integrate. Revenue from day one.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center h-12 lg:h-14 px-6 lg:px-8 text-base lg:text-lg font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all"
            >
              Get your API key
            </a>
            <a
              href="/docs"
              className="inline-flex items-center justify-center h-12 lg:h-14 px-6 lg:px-8 text-base lg:text-lg font-medium rounded-full border border-[#ffffff15] text-foreground hover:bg-[#ffffff05] transition-all"
            >
              Read the docs
            </a>
          </div>

          <p className="text-sm text-muted-foreground mt-10 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa]" />
            Available on Solana. More chains coming soon.
          </p>
        </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto px-6 lg:px-16 max-w-[1280px] w-full relative z-[2]">
          {/* Mobile: single column list. Desktop: 4-column grid */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-10 mb-16 text-center">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm text-muted-foreground/60 italic mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        {item.label}
                        {"external" in item && item.external && (
                          <span className="ml-0.5 text-[10px]">&#8599;</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile: compact inline links */}
          <div className="sm:hidden mb-10">
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {columns.flatMap((col) =>
                col.links.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {item.label}
                    {"external" in item && item.external && (
                      <span className="ml-0.5 text-[10px]">&#8599;</span>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-[#ffffff08] pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link href="/" className="text-sm font-bold tracking-tight">
              Buff
            </Link>
            <p className="text-xs text-muted-foreground/40">
              &copy; {new Date().getFullYear()} Buff Protocol
            </p>
          </div>
      </div>
    </section>
  );
}
