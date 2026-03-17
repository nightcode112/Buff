"use client";

import { type ReactNode } from "react";

interface DocLayoutProps {
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
}

export function DocContent({ title, description, badge, children }: DocLayoutProps) {
  return (
    <article className="max-w-3xl py-12 px-8 lg:px-12">
      <div className="mb-10 pb-8 border-b border-border/50">
        {badge && (
          <span className="inline-block text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md mb-4 font-mono">
            {badge}
          </span>
        )}
        <h1 className="text-[2rem] font-bold tracking-tight text-foreground mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-[17px] text-muted-foreground leading-relaxed max-w-xl">
            {description}
          </p>
        )}
      </div>
      <div className="prose-buff">{children}</div>
    </article>
  );
}

export function DocH2({ children, id }: { children: string; id?: string }) {
  const anchor = id || children.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  return (
    <h2
      id={anchor}
      className="text-[1.125rem] font-semibold tracking-tight text-foreground mt-10 mb-3 scroll-mt-24 group flex items-center gap-2"
    >
      {children}
      <a
        href={`#${anchor}`}
        className="opacity-0 group-hover:opacity-30 text-foreground transition-opacity text-sm font-normal"
        aria-hidden
      >
        #
      </a>
    </h2>
  );
}

export function DocH3({ children, id }: { children: string; id?: string }) {
  const anchor = id || children.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  return (
    <h3
      id={anchor}
      className="text-[0.9375rem] font-semibold tracking-tight text-foreground mt-7 mb-2.5 scroll-mt-24"
    >
      {children}
    </h3>
  );
}

export function DocP({ children }: { children: ReactNode }) {
  return (
    <p className="text-[15px] text-foreground/75 leading-[1.75] mb-4">{children}</p>
  );
}

export function DocList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mb-6 ml-0">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[15px] text-foreground/75 leading-[1.75]">
          <span className="text-muted-foreground/60 mt-[0.1em] select-none shrink-0">–</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DocNote({
  children,
  type = "info",
}: {
  children: ReactNode;
  type?: "info" | "warning";
}) {
  const styles = {
    info: "border-l-[3px] border-gold/50 bg-gold/[0.03]",
    warning: "border-l-[3px] border-orange-400/60 bg-orange-400/[0.03]",
  };
  const labels = { info: "Note", warning: "Warning" };
  const labelColors = { info: "text-gold/80", warning: "text-orange-400/80" };

  return (
    <div className={`${styles[type]} pl-4 pr-4 py-3 rounded-r-lg mb-6`}>
      <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${labelColors[type]}`}>
        {labels[type]}
      </span>
      <div className="text-[14px] text-foreground/70 leading-relaxed">{children}</div>
    </div>
  );
}

export function DocSteps({ children }: { children: ReactNode }) {
  return <div className="mb-6">{children}</div>;
}

export function DocStep({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <div className="relative pl-12 pb-8 group last:pb-0">
      <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full border border-border bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground z-10">
        {step}
      </div>
      <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border/40 group-last:hidden" />
      <h2 className="text-[1.125rem] font-semibold text-foreground mb-3 mt-0.5 scroll-mt-24">{title}</h2>
      {children}
    </div>
  );
}

export function DocTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto mb-6 rounded-lg border border-border/50">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="border-b border-border/50 bg-muted/40">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left px-4 py-2.5 font-medium text-foreground/80 text-[13px] tracking-tight"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-2.5 leading-relaxed ${j === 0 ? "text-foreground/90 font-medium" : "text-foreground/60"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
