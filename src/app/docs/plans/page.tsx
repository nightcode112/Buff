"use client";

import { useState } from "react";

function DollarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    setEditing(false);
    const v = parseFloat(draft);
    if (!isNaN(v) && v >= 0) onChange(v);
    else setDraft(String(value));
  };

  return (
    <div className="flex items-center rounded-lg border border-border/30 bg-secondary/40 overflow-hidden focus-within:border-gold/30 focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.1)] transition-all w-36">
      <span className="text-gold/50 text-sm pl-3 font-medium">$</span>
      <input
        type="text"
        inputMode="decimal"
        value={editing ? draft : value}
        onFocus={() => { setDraft(String(value)); setEditing(true); }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        className="w-full bg-transparent py-2.5 px-2 text-sm text-foreground font-mono focus:outline-none"
      />
    </div>
  );
}
import {
  DocContent,
  DocH2,
  DocP,
  DocTable,
  DocNote,
} from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

const plans = [
  { name: "Seed", roundTo: 0.05, fee: 1.0, color: "#10b981" },
  { name: "Sprout", roundTo: 0.10, fee: 0.75, color: "#34d399" },
  { name: "Tree", roundTo: 0.50, fee: 0.5, color: "#60a5fa" },
  { name: "Forest", roundTo: 1.00, fee: 0.25, color: "#3b82f6" },
];

function calculateRoundUp(value: number, roundTo: number): number {
  const scale = 1_000_000;
  const sv = Math.round(value * scale);
  const sr = Math.round(roundTo * scale);
  const rem = sv % sr;
  if (rem === 0) return 0;
  return (sr - rem) / scale;
}

export default function PlansPage() {
  const [txValue, setTxValue] = useState(27.63);

  return (
    <DocContent
      title="Plan Tiers"
      description="Each plan rounds to a different increment. Higher round-up = more invested per transaction = lower Buff fee."
      badge="Core Concept"
    >
      <DocH2>The Four Plans</DocH2>
      <DocTable
        headers={["Plan", "Rounds to", "Buff Fee", "Best for"]}
        rows={[
          ["Seed", "$0.05", "1.00%", "Micro-investing, barely noticeable"],
          ["Sprout (default)", "$0.10", "0.75%", "Balanced, good starting point"],
          ["Tree", "$0.50", "0.50%", "Active investors"],
          ["Forest", "$1.00", "0.25%", "Maximum investment per tx"],
        ]}
      />

      <DocH2>Interactive Calculator</DocH2>
      <DocP>
        Enter a transaction value to see how each plan rounds it up differently.
      </DocP>

      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm text-muted-foreground">Transaction value:</label>
        <DollarInput value={txValue} onChange={setTxValue} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {plans.map((plan) => {
          const roundUp = calculateRoundUp(txValue, plan.roundTo);
          const buffFee = roundUp * (plan.fee / 100);
          const invested = roundUp - buffFee;
          const skipped = roundUp === 0;

          return (
            <div
              key={plan.name}
              className="premium-card rounded-xl p-5 group hover:border-gold/15 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: plan.color }}
                />
                <span className="text-sm font-bold">{plan.name}</span>
              </div>

              {skipped ? (
                <div className="text-sm text-muted-foreground italic">
                  Skipped (exact match)
                </div>
              ) : (
                <>
                  <div className="text-2xl font-extrabold text-gold number-glow mb-1">
                    ${roundUp.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${txValue.toFixed(2)} → ${(txValue + roundUp).toFixed(2)}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/20 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Invested</span>
                      <span className="text-foreground">${invested.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Buff fee</span>
                      <span className="text-foreground">${buffFee.toFixed(4)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <DocH2>Rules</DocH2>
      <DocTable
        headers={["Rule", "Behavior"]}
        rows={[
          ["Exact match", "$2.00 with $0.50 increment → skip, no charge"],
          ["Ceiling", "Max round-up is $1.00 per transaction"],
          ["Fee calculation", "All fee logic is server-side — treasury address never exposed"],
        ]}
      />

      <DocH2>Setting a Plan</DocH2>
      <CodeBlock
        filename="plans.ts"
        code={`// Set during construction
const buff = new Buff({
  plan: "tree",  // $0.50 round-up
  // ...
})

// Or change at runtime
buff.setPlan("forest")         // switch to $1.00
buff.setInvestAsset("ETH")     // change target asset

// Get all available plans from the API
const plans = await buff.getPlans()
// [{ tier: "seed", roundToUsd: 0.05, feePercent: 1.00 }, ...]`}
      />

      <DocNote>
        Users should choose their plan based on how aggressively they want
        to invest. Seed is barely noticeable ($0.02-$0.05 per tx), Forest
        can add up to $0.99 per transaction. Plan details are available via
        the getPlans() API.
      </DocNote>
    </DocContent>
  );
}
