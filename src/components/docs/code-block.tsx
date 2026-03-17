"use client";

import { useState, useEffect } from "react";

interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  lang = "typescript",
  filename,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div className="group relative rounded-xl overflow-hidden border border-border/50 bg-[#0c0b10] shadow-[0_4px_24px_rgba(0,0,0,0.1)]">
      {/* Header */}
      {filename && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-[#0e0d13]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {filename}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
              {lang}
            </span>
          </div>
        </div>
      )}

      {/* Code */}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-[13px] leading-6 font-mono text-slate-300">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex hover:bg-white/[0.04] -mx-4 px-4 rounded">
                {showLineNumbers && (
                  <span className="select-none text-slate-600 w-8 shrink-0 text-right mr-4 text-xs leading-6">
                    {i + 1}
                  </span>
                )}
                <span
                  className="flex-1 text-slate-300"
                  suppressHydrationWarning
                  {...(mounted ? { dangerouslySetInnerHTML: { __html: highlightLine(line, lang) } } : { children: line })}
                />
              </div>
            ))}
          </code>
        </pre>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 backdrop-blur px-2.5 py-1.5 rounded-md border border-slate-600 hover:border-slate-500 cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function highlightLine(line: string, lang: string): string {
  if (lang === "bash" || lang === "shell") {
    if (line.startsWith("#")) return `<span class="text-[#475569]">${esc(line)}</span>`;
    if (line.startsWith("$")) return `<span style="color:#64748b">$</span>${esc(line.slice(1))}`;
    return esc(line);
  }

  // TypeScript highlighting
  let result = esc(line);

  // Comments
  if (line.trimStart().startsWith("//")) {
    return `<span style="color:#475569">${result}</span>`;
  }

  // Keywords
  result = result.replace(
    /\b(import|export|from|const|let|var|async|await|function|return|if|else|new|throw|try|catch|class|extends|type|interface|typeof|as)\b/g,
    '<span style="color:#93c5fd">$1</span>'
  );

  // Strings
  result = result.replace(
    /(&quot;[^&]*&quot;|&#39;[^&]*&#39;|`[^`]*`|"[^"]*"|'[^']*')/g,
    '<span style="color:#fbbf24">$1</span>'
  );

  // Function calls
  result = result.replace(
    /\b([a-zA-Z_]\w*)\s*\(/g,
    '<span style="color:#34d399">$1</span>('
  );

  // Numbers
  result = result.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span style="color:#f59e0b">$1</span>'
  );

  return result;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Inline code */
export function InlineCode({ children }: { children: string }) {
  return (
    <code className="text-[13px] font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
      {children}
    </code>
  );
}

/** Install command */
export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0c0b10] border border-border/50 cursor-pointer hover:border-gold/20 hover:shadow-[0_4px_16px_rgba(59,130,246,0.05)] transition-all"
    >
      <span className="text-slate-500 text-sm font-mono">$</span>
      <code className="text-sm text-slate-200 font-mono flex-1">
        {command}
      </code>
      <span className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium">
        {copied ? "Copied!" : "Copy"}
      </span>
    </div>
  );
}

/** Package manager tab installer */
const managers = ["npm", "yarn", "pnpm"] as const;
type Manager = typeof managers[number];

const prefixes: Record<Manager, string> = {
  npm: "npm install",
  yarn: "yarn add",
  pnpm: "pnpm add",
};

export function PackageInstall({ pkg }: { pkg: string }) {
  const [active, setActive] = useState<Manager>("npm");
  const [copied, setCopied] = useState(false);

  const command = `${prefixes[active]} ${pkg}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border/50 bg-[#0c0b10] mb-6">
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-border/30 bg-[#0e0d13] px-1 pt-1">
        {managers.map((m) => (
          <button
            key={m}
            onClick={() => setActive(m)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors cursor-pointer ${
              active === m
                ? "text-slate-200 bg-[#0c0b10] border border-b-0 border-border/30"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      {/* Command */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-slate-500 text-sm font-mono select-none">$</span>
        <code className="text-sm text-slate-200 font-mono flex-1">{command}</code>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
