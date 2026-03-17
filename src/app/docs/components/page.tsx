"use client";

import { useState, useRef, useEffect } from "react";
import { DocContent, DocH2, DocP, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

// ── Custom Dropdown ──
function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  renderOption,
  renderSelected,
}: {
  value: T;
  onChange: (v: T) => void;
  options: T[];
  renderOption: (opt: T, active: boolean) => React.ReactNode;
  renderSelected: (opt: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between bg-secondary/40 border rounded-lg px-3 py-2.5 text-sm text-foreground font-medium transition-all cursor-pointer ${
          open
            ? "border-gold/30 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]"
            : "border-border/30 hover:border-border/60"
        }`}
      >
        {renderSelected(value)}
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 rounded-xl border border-border/40 bg-card shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-up" style={{ animationDuration: "0.15s" }}>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full flex items-center px-3 py-2.5 text-sm transition-colors ${
                value === opt
                  ? "bg-gold/[0.06] text-gold font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {renderOption(opt, value === opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type PlanKey = "seed" | "sprout" | "tree" | "forest";
type AssetKey = "BTC" | "ETH" | "SOL" | "USDC";

const PLANS: Record<PlanKey, { label: string; roundTo: number; fee: number }> = {
  seed: { label: "Seed", roundTo: 0.05, fee: 1.0 },
  sprout: { label: "Sprout", roundTo: 0.10, fee: 0.75 },
  tree: { label: "Tree", roundTo: 0.50, fee: 0.5 },
  forest: { label: "Forest", roundTo: 1.00, fee: 0.25 },
};

const ASSETS: Record<AssetKey, { color: string; price: number }> = {
  BTC: { color: "#F7931A", price: 71000 },
  ETH: { color: "#627EEA", price: 2100 },
  SOL: { color: "#9945FF", price: 88 },
  USDC: { color: "#2775CA", price: 1 },
};

function calcRoundUp(value: number, roundTo: number): number {
  const scale = 1_000_000;
  const sv = Math.round(value * scale);
  const sr = Math.round(roundTo * scale);
  const rem = sv % sr;
  if (rem === 0) return 0;
  return (sr - rem) / scale;
}

// ── Dollar Input ──
function DollarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    setEditing(false);
    const v = parseFloat(draft);
    if (!isNaN(v) && v >= 0) {
      onChange(v);
    } else {
      setDraft(String(value));
    }
  };

  const startEdit = () => {
    setDraft(String(value));
    setEditing(true);
  };

  return (
    <div>
      <label className="text-[11px] text-muted-foreground block mb-2 uppercase tracking-wider">{label}</label>
      <div className="flex items-center rounded-lg border border-border/30 bg-secondary/40 overflow-hidden focus-within:border-gold/30 focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.1)] transition-all">
        <span className="text-gold/50 text-sm pl-3 font-medium">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={editing ? draft : value}
          onFocus={startEdit}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
          className="w-full bg-transparent py-2.5 px-2 text-sm text-foreground font-mono focus:outline-none"
        />
      </div>
    </div>
  );
}

// ── Threshold Input ──
function ThresholdInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    setEditing(false);
    const v = parseFloat(draft);
    if (!isNaN(v) && v >= 0.5) {
      onChange(v);
    } else {
      setDraft(String(value));
    }
  };

  const startEdit = () => {
    setDraft(String(value));
    setEditing(true);
  };

  return (
    <div>
      <label className="text-[11px] text-muted-foreground block mb-2 uppercase tracking-wider">Threshold</label>
      <div className="flex items-center gap-0 rounded-lg border border-border/30 overflow-hidden bg-secondary/40 focus-within:border-gold/30 focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.1)] transition-all">
        <button
          onClick={() => onChange(Math.max(0.5, value - 1))}
          className="w-10 h-[42px] flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/5 transition-all text-lg font-medium border-r border-border/30 shrink-0"
        >
          −
        </button>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-gold/50 text-sm">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={editing ? draft : value}
            onFocus={startEdit}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
            className="w-14 bg-transparent text-center text-sm font-bold text-foreground font-mono focus:outline-none"
          />
        </div>
        <button
          onClick={() => onChange(value + 1)}
          className="w-10 h-[42px] flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/5 transition-all text-lg font-medium border-l border-border/30 shrink-0"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ── Configurator Panel ──
function ConfigPanel({
  plan, setPlan,
  asset, setAsset,
  threshold, setThreshold,
  txValue, setTxValue,
}: {
  plan: PlanKey; setPlan: (p: PlanKey) => void;
  asset: AssetKey; setAsset: (a: AssetKey) => void;
  threshold: number; setThreshold: (t: number) => void;
  txValue: number; setTxValue: (v: number) => void;
}) {
  return (
    <div className="premium-card rounded-2xl p-6 mb-8">
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-5">
        Configure all widgets
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {/* Plan — custom dropdown */}
        <div>
          <label className="text-[11px] text-muted-foreground block mb-2 uppercase tracking-wider">Plan</label>
          <CustomSelect
            value={plan}
            onChange={setPlan}
            options={Object.keys(PLANS) as PlanKey[]}
            renderSelected={(k) => (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold" />
                {PLANS[k].label}
              </span>
            )}
            renderOption={(k, active) => (
              <span className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${active ? "bg-gold" : "bg-border"}`} />
                  {PLANS[k].label}
                </span>
                <span className={`text-xs ${active ? "text-gold/70" : "text-muted-foreground/50"}`}>
                  ${PLANS[k].roundTo.toFixed(2)}
                </span>
              </span>
            )}
          />
        </div>

        {/* Asset — custom dropdown */}
        <div>
          <label className="text-[11px] text-muted-foreground block mb-2 uppercase tracking-wider">Invest into</label>
          <CustomSelect
            value={asset}
            onChange={setAsset}
            options={Object.keys(ASSETS) as AssetKey[]}
            renderSelected={(k) => (
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ASSETS[k].color }} />
                {k}
              </span>
            )}
            renderOption={(k, active) => (
              <span className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ASSETS[k].color }} />
                <span>{k}</span>
              </span>
            )}
          />
        </div>

        {/* Threshold — editable stepper */}
        <ThresholdInput value={threshold} onChange={setThreshold} />

        {/* Tx Value — custom input with $ prefix */}
        <DollarInput value={txValue} onChange={setTxValue} label="Tx value" />
      </div>
    </div>
  );
}

// ── Toggle Widget ──
function BuffTogglePreview({ plan, setPlan, asset }: {
  plan: PlanKey; setPlan: (p: PlanKey) => void; asset: AssetKey;
}) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="premium-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <span className="text-gold text-xs font-bold">$</span>
          </div>
          <div>
            <div className="text-sm font-bold">Buff Round-Up</div>
            <div className="text-xs text-muted-foreground">Auto-invest into {asset}</div>
          </div>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`w-12 h-7 rounded-full transition-all duration-300 relative ${enabled ? "bg-gold shadow-[0_0_12px_rgba(59,130,246,0.3)]" : "bg-border"}`}
        >
          <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md absolute top-[3px] transition-transform duration-300 ${enabled ? "translate-x-[22px]" : "translate-x-[3px]"}`} />
        </button>
      </div>

      {enabled && (
        <>
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {(Object.keys(PLANS) as PlanKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setPlan(key)}
                className={`text-[11px] py-2 rounded-lg font-semibold transition-all ${
                  plan === key
                    ? "bg-gold/10 text-gold border border-gold/20 shadow-[0_2px_8px_rgba(59,130,246,0.1)]"
                    : "text-muted-foreground hover:text-foreground border border-transparent hover:bg-accent"
                }`}
              >
                {PLANS[key].label}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Rounds to <span className="text-foreground font-medium">${PLANS[plan].roundTo.toFixed(2)}</span></span>
            <span>Buff fee <span className="text-foreground font-medium">{PLANS[plan].fee}%</span></span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Round-Up Preview Widget ──
function RoundUpPreviewWidget({ txValue, plan, asset }: {
  txValue: number; plan: PlanKey; asset: AssetKey;
}) {
  const roundUp = calcRoundUp(txValue, PLANS[plan].roundTo);
  const buffFee = roundUp * (PLANS[plan].fee / 100);
  const invested = roundUp - buffFee;
  const skipped = roundUp === 0;
  const cappedRaw = roundUp > 1 ? 1 : roundUp;
  const roundedTo = txValue + roundUp;

  return (
    <div className="premium-card rounded-2xl p-5">
      {skipped ? (
        <div className="text-center py-4">
          <div className="text-sm text-muted-foreground mb-1">Exact match</div>
          <div className="text-lg font-bold">${txValue.toFixed(2)}</div>
          <div className="text-xs text-sage mt-2">No round-up — no charge</div>
        </div>
      ) : (
        <>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">This transaction</div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tx value</span>
              <span className="text-sm font-bold">${txValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rounded to</span>
              <span className="text-sm font-bold">${roundedTo.toFixed(2)}</span>
            </div>
            <div className="h-px bg-border/30" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gold font-semibold">Round-up</span>
              <span className="text-sm font-bold text-gold">${roundUp.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">You invest</span>
              <span className="text-xs font-medium">${invested.toFixed(4)} → {asset}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Buff fee ({PLANS[plan].fee}%)</span>
              <span className="text-xs font-medium">${buffFee.toFixed(4)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Portfolio Widget ──
function PortfolioWidget({ asset, threshold, totalInvested }: {
  asset: AssetKey; threshold: number; totalInvested: number;
}) {
  const pendingSol = 0.012;
  const solPrice = ASSETS.SOL.price;
  const pendingUsd = pendingSol * solPrice;
  const progressPct = Math.min((pendingUsd / threshold) * 100, 100);

  const holdings = [
    { name: asset, value: totalInvested * 0.85, color: ASSETS[asset].color },
    ...(asset !== "SOL" ? [{ name: "SOL" as AssetKey, value: totalInvested * 0.15, color: ASSETS.SOL.color }] : []),
  ];
  const total = holdings.reduce((s, h) => s + h.value, 0);

  return (
    <div className="premium-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Buff Portfolio</div>
        <div className="text-xs text-sage font-semibold">+18.6%</div>
      </div>
      <div className="text-3xl font-extrabold text-gold number-glow mb-1">${total.toFixed(2)}</div>
      <div className="text-xs text-muted-foreground mb-4">142 round-ups</div>

      {/* Allocation bar */}
      <div className="flex rounded-full overflow-hidden h-2.5 gap-0.5 mb-4">
        {holdings.map((h) => (
          <div
            key={h.name}
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(h.value / total) * 100}%`,
              backgroundColor: h.color,
              opacity: 0.75,
            }}
          />
        ))}
      </div>

      {/* Holdings */}
      <div className="space-y-2 mb-5">
        {holdings.map((h) => (
          <div key={h.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
              <span className="font-medium">{h.name}</span>
              <span className="text-xs text-muted-foreground">{((h.value / total) * 100).toFixed(0)}%</span>
            </div>
            <span className="font-semibold">${h.value.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Pending bar */}
      <div className="pt-4 border-t border-border/20">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Next swap at ${threshold.toFixed(0)}</span>
          <span className="text-foreground font-medium">${pendingUsd.toFixed(2)} / ${threshold.toFixed(0)}</span>
        </div>
        <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold/60 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Stats Widget ──
function StatsWidget({ plan, asset, totalInvested }: {
  plan: PlanKey; asset: AssetKey; totalInvested: number;
}) {
  const buffFees = totalInvested * (PLANS[plan].fee / 100);

  return (
    <div className="premium-card rounded-2xl p-6">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Lifetime Stats</div>
      <div className="grid grid-cols-2 gap-5">
        {[
          { label: "Round-ups", value: "142" },
          { label: "Total invested", value: `$${totalInvested.toFixed(2)}` },
          { label: "Buff fees paid", value: `$${buffFees.toFixed(2)}` },
          { label: "Investing into", value: asset },
          { label: "Plan", value: PLANS[plan].label },
          { label: "Last swap", value: "2h ago" },
        ].map((s) => (
          <div key={s.label} className="group">
            <div className="text-lg font-bold group-hover:text-gold transition-colors">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──
export default function ComponentsPage() {
  const [plan, setPlan] = useState<PlanKey>("sprout");
  const [asset, setAsset] = useState<AssetKey>("BTC");
  const [threshold, setThreshold] = useState(5);
  const [txValue, setTxValue] = useState(47.83);
  const totalInvested = 82.8;

  return (
    <DocContent
      title="Components"
      description="Drop-in React components for platforms integrating Buff. Fully configurable — change any value and all widgets update live."
      badge="Templates"
    >
      {/* Global config panel */}
      <ConfigPanel
        plan={plan} setPlan={setPlan}
        asset={asset} setAsset={setAsset}
        threshold={threshold} setThreshold={setThreshold}
        txValue={txValue} setTxValue={setTxValue}
      />

      <DocH2>Buff Toggle</DocH2>
      <DocP>Let users enable/disable Buff and pick their plan. Toggle it, change plans — the round-up preview below updates instantly.</DocP>
      <div className="mb-6 max-w-sm">
        <BuffTogglePreview plan={plan} setPlan={setPlan} asset={asset} />
      </div>

      <CodeBlock filename="BuffToggle.tsx" code={`"use client"
import { useState } from "react"
import type { Buff, PlanTier } from "@buff/sdk"

interface BuffToggleProps {
  buff: Buff | null
  onToggle: (enabled: boolean) => void
  onPlanChange: (plan: PlanTier) => void
  defaultPlan?: PlanTier
  investAsset?: string
}

export function BuffToggle({
  buff, onToggle, onPlanChange,
  defaultPlan = "sprout", investAsset = "BTC"
}: BuffToggleProps) {
  const [enabled, setEnabled] = useState(true)
  const [plan, setPlan] = useState(defaultPlan)

  const plans = [
    { key: "seed", label: "Seed", roundTo: 0.05 },
    { key: "sprout", label: "Sprout", roundTo: 0.10 },
    { key: "tree", label: "Tree", roundTo: 0.50 },
    { key: "forest", label: "Forest", roundTo: 1.00 },
  ]

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    onToggle(next)
  }

  const changePlan = (key: string) => {
    setPlan(key as PlanTier)
    onPlanChange(key as PlanTier)
    if (buff) buff.setPlan(key as any)
  }

  return (
    <div className="rounded-xl border p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium">Buff Round-Up</div>
          <div className="text-xs text-muted-foreground">
            Auto-invest into {investAsset}
          </div>
        </div>
        <button onClick={toggle} className={\`w-12 h-7 rounded-full
          \${enabled ? "bg-amber-500" : "bg-gray-600"}\`}>
          <div className={\`w-5 h-5 rounded-full bg-white transform
            \${enabled ? "translate-x-[22px]" : "translate-x-[3px]"}\`} />
        </button>
      </div>
      {enabled && (
        <div className="grid grid-cols-4 gap-1">
          {plans.map((p) => (
            <button key={p.key}
              onClick={() => changePlan(p.key)}
              className={\`text-xs py-2 rounded-lg font-medium
                \${plan === p.key
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  : "text-muted-foreground hover:bg-accent"
                }\`}>
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}`} />

      <DocH2>Round-Up Preview</DocH2>
      <DocP>Shows users exactly what their round-up will be. Change the tx value in the configurator above to see it update.</DocP>
      <div className="mb-6 max-w-sm">
        <RoundUpPreviewWidget txValue={txValue} plan={plan} asset={asset} />
      </div>

      <CodeBlock filename="RoundUpPreview.tsx" code={`"use client"
import type { RoundUpBreakdown } from "@buff/sdk"

interface RoundUpPreviewProps {
  breakdown: RoundUpBreakdown | null
  asset: string
}

export function RoundUpPreview({ breakdown, asset }: RoundUpPreviewProps) {
  if (!breakdown || breakdown.skipped) {
    return (
      <div className="rounded-xl border p-4 bg-card text-center">
        <p className="text-sm text-muted-foreground">No round-up needed</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border p-4 bg-card">
      <div className="flex justify-between text-sm mb-2">
        <span>Tx value</span>
        <span>\${breakdown.txValueUsd.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span>Rounded to</span>
        <span>\${breakdown.roundedToUsd.toFixed(2)}</span>
      </div>
      <hr className="my-2" />
      <div className="flex justify-between font-semibold text-amber-500">
        <span>Investing</span>
        <span>\${breakdown.roundUpUsd.toFixed(2)} → {asset}</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Buff fee ({breakdown.buffFeePercent}%)</span>
        <span>\${breakdown.buffFeeUsd.toFixed(4)}</span>
      </div>
    </div>
  )
}

// Usage:
// const breakdown = await buff.calculateRoundUp(txValueUsd)
// <RoundUpPreview breakdown={breakdown} asset="BTC" />`} />

      <DocH2>Portfolio Card</DocH2>
      <DocP>Displays portfolio with allocation bar, holdings breakdown, and progress toward next swap. Change asset and threshold above.</DocP>
      <div className="mb-6 max-w-sm">
        <PortfolioWidget asset={asset} threshold={threshold} totalInvested={totalInvested} />
      </div>

      <CodeBlock filename="BuffPortfolio.tsx" code={`"use client"
import { useState, useEffect } from "react"
import type { Buff, Portfolio } from "@buff/sdk"

interface BuffPortfolioProps {
  buff: Buff | null
  walletAddress: string   // Buff wallet address (from deriveWallet)
  refreshInterval?: number // ms, default 60000
}

export function BuffPortfolio({ buff, walletAddress, refreshInterval = 60000 }: BuffPortfolioProps) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)

  useEffect(() => {
    if (!buff || !walletAddress) return
    const fetch = () => buff.getPortfolio(walletAddress).then(setPortfolio)
    fetch()
    const interval = setInterval(fetch, refreshInterval)
    return () => clearInterval(interval)
  }, [buff, walletAddress, refreshInterval])

  if (!portfolio) return <div className="animate-pulse h-40 rounded-xl bg-card" />

  const total = portfolio.totalUsd

  return (
    <div className="rounded-xl border p-5 bg-card">
      <div className="text-2xl font-bold mb-1">\${total.toFixed(2)}</div>
      <div className="text-xs text-muted-foreground mb-4">
        {portfolio.pendingSol.toFixed(4)} SOL pending
        ({" "}
        \${portfolio.pendingUsd.toFixed(2)}
        {" "})
      </div>
      {portfolio.balances.map((b) => (
        <div key={b.asset} className="flex justify-between text-sm py-1.5 border-t">
          <span className="font-medium">{b.asset}</span>
          <span>\${b.usdValue.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}`} />

      <DocH2>Stats Card</DocH2>
      <DocP>Lifetime statistics. The Buff fees shown reflect the current plan&apos;s fee rate.</DocP>
      <div className="mb-6 max-w-sm">
        <StatsWidget plan={plan} asset={asset} totalInvested={totalInvested} />
      </div>

      <CodeBlock filename="BuffStats.tsx" code={`"use client"
import { useState, useEffect } from "react"
import type { Buff } from "@buff/sdk"

interface BuffStatsProps {
  buff: Buff | null
  walletAddress: string
}

export function BuffStats({ buff, walletAddress }: BuffStatsProps) {
  const [portfolio, setPortfolio] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    if (!buff || !walletAddress) return
    buff.getPortfolio(walletAddress).then(setPortfolio)
    buff.getPlans().then(setPlans)
  }, [buff, walletAddress])

  if (!portfolio) return null

  return (
    <div className="rounded-xl border p-5 bg-card">
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Total value" value={\`\$\${portfolio.totalUsd.toFixed(2)}\`} />
        <Stat label="Pending SOL" value={portfolio.pendingSol.toFixed(4)} />
        <Stat label="Assets" value={portfolio.balances.length.toString()} />
        <Stat label="Plans available" value={plans.length.toString()} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}`} />

      <DocNote>
        All widgets are controlled — they respond to props from the configurator.
        In your app, connect them to the real Buff instance. The code samples show
        exactly how. Note that getPortfolio() now requires a wallet address parameter,
        and plan info is fetched via getPlans(). Styling uses basic Tailwind — customize
        to match your design system.
      </DocNote>
    </DocContent>
  );
}
