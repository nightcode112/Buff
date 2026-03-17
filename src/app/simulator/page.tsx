"use client";

import { useState, useEffect } from "react";

type Plan = "Seed" | "Sprout" | "Tree" | "Forest";

interface Tx {
  sig: string; time: number | null; value: number;
  fee: number; feeUsd: number;
  ru: Array<{ p: string; ru: number; inv: number; sk: boolean }>;
}

interface Proto { key: string; name: string; cat: string; icon: string; color: string; pid: string }

interface Quote {
  input: { amountUsd: number; token: string };
  output: { token: string; amount: string | null; route: string | null; priceImpact: string | null };
  gas: { estimatedSol: number; estimatedUsd: number };
  roundUps: Array<{ plan: string; roundTo: number; roundUpUsd: number; roundedToUsd?: number; investedUsd: number; buffFeeUsd: number; buffFeePercent?: number; monthlyInvested?: number; skipped: boolean }>;
  solPriceUsd: number;
}

export default function SimulatorPage() {
  const [protos, setProtos] = useState<Proto[]>([]);
  const [sol, setSol] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan>("Sprout");
  const [amt, setAmt] = useState("100");
  const [draft, setDraft] = useState("100");
  const [editing, setEditing] = useState(false);
  const [from, setFrom] = useState("SOL");
  const [to, setTo] = useState("USDC");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [qLoading, setQLoading] = useState(false);

  useEffect(() => {
    fetch("/api/simulator").then(r => r.json()).then(d => {
      if (d.ok) { setProtos(d.data.protocols); setSol(d.data.sol); }
    });
  }, []);

  const loadProto = async (k: string) => {
    if (sel === k) { setSel(null); return; }
    setSel(k); setLoading(true); setTxs([]);
    try {
      const r = await fetch(`/api/simulator?protocol=${k}`);
      const d = await r.json();
      if (d.ok) setTxs(d.data.txs);
    } catch {}
    setLoading(false);
  };

  const simulate = async () => {
    setQLoading(true);
    try {
      const r = await fetch("/api/simulator/quote", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputAmountUsd: parseFloat(amt) || 100, inputToken: from, outputToken: to }),
      });
      const d = await r.json();
      if (d.ok) { setQuote(d.data); setSol(d.data.solPriceUsd); }
    } catch {}
    setQLoading(false);
  };

  const commit = () => {
    setEditing(false);
    const v = parseFloat(draft);
    if (!isNaN(v) && v > 0) setAmt(String(v));
    else setDraft(amt);
  };

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-extrabold">Simulator</h1>
          <span className="text-[10px] font-bold bg-sage/10 text-sage px-2 py-0.5 rounded border border-sage/15 uppercase tracking-wider">Live</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Real Jupiter quotes & mainnet txs.{sol > 0 && <> SOL <span className="text-foreground font-medium">${sol.toFixed(2)}</span></>}
        </p>

        {/* Custom Sim */}
        <div className="premium-card rounded-xl p-5 mb-8">
          <div className="text-[10px] text-gold uppercase tracking-[0.15em] font-bold mb-4">Custom Simulation</div>
          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div className="w-28">
              <div className="text-[10px] text-muted-foreground mb-1">Amount</div>
              <div className="flex items-center rounded-lg border border-border/30 bg-secondary/40 focus-within:border-gold/30 transition-all">
                <span className="text-gold/50 text-xs pl-2">$</span>
                <input type="text" inputMode="decimal" value={editing ? draft : amt}
                  onFocus={() => { setDraft(amt); setEditing(true); }}
                  onChange={e => setDraft(e.target.value)} onBlur={commit}
                  onKeyDown={e => { if (e.key === "Enter") commit(); }}
                  className="w-full bg-transparent py-2 px-1.5 text-sm font-mono focus:outline-none" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">From</div>
              <div className="flex gap-1">
                {["SOL", "USDC"].map(t => (
                  <button key={t} onClick={() => setFrom(t)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${from === t ? "bg-gold/10 text-gold border border-gold/20" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">To</div>
              <div className="flex gap-1">
                {["USDC", "SOL", "BTC", "ETH"].filter(t => t !== from).slice(0, 3).map(t => (
                  <button key={t} onClick={() => setTo(t)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${to === t ? "bg-gold/10 text-gold border border-gold/20" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={simulate} disabled={qLoading} className="btn-gold px-5 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
              {qLoading ? "..." : "Simulate"}
            </button>
          </div>

          {quote && (
            <div className="border-t border-border/20 pt-4">
              {quote.output.route && (
                <div className="text-[11px] text-muted-foreground mb-3">
                  <span className="text-sage font-medium">Route:</span> {quote.output.route}
                  {quote.output.priceImpact && <span className="ml-1 opacity-60">({quote.output.priceImpact}%)</span>}
                  <span className="ml-3">Gas: {quote.gas.estimatedSol.toFixed(6)} SOL</span>
                </div>
              )}
              <div className="grid grid-cols-4 gap-2">
                {quote.roundUps.map(ru => (
                  <button key={ru.plan} onClick={() => setPlan(ru.plan as Plan)}
                    className={`rounded-lg p-3 border text-left transition-all ${plan === ru.plan ? "border-gold/25 bg-gold/[0.04]" : "border-border/15 hover:border-border/30"}`}>
                    <div className="text-[10px] text-muted-foreground">{ru.plan} (${ru.roundTo})</div>
                    {ru.skipped ? <div className="text-xs text-muted-foreground mt-1">Skip</div> : (
                      <>
                        <div className="text-lg font-bold text-gold">${ru.roundUpUsd.toFixed(2)}</div>
                        <div className="text-[10px] text-muted-foreground">${quote.input.amountUsd} → ${ru.roundedToUsd?.toFixed(2)}</div>
                        <div className="text-[10px] text-sage mt-1">${ru.monthlyInvested?.toFixed(0)}/mo</div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Plan */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Plan</span>
          <div className="flex gap-1 p-0.5 rounded-lg bg-secondary/40 border border-border/30">
            {(["Seed", "Sprout", "Tree", "Forest"] as Plan[]).map(p => (
              <button key={p} onClick={() => setPlan(p)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${plan === p ? "bg-gold/10 text-gold" : "text-muted-foreground"}`}>{p}</button>
            ))}
          </div>
        </div>

        {/* Protocols */}
        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold mb-3">Real Mainnet Transactions</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {protos.map(p => (
            <div key={p.key} className="premium-card rounded-xl overflow-hidden">
              <button onClick={() => loadProto(p.key)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black"
                    style={{ backgroundColor: p.color + "15", border: `1px solid ${p.color}30`, color: p.color }}>
                    {p.icon.slice(0, 3)}
                  </div>
                  <div><div className="text-sm font-bold">{p.name}</div><div className="text-[10px] text-muted-foreground">{p.cat}</div></div>
                </div>
                <svg className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${sel === p.key ? "rotate-180" : ""}`}
                  viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6l4 4 4-4" /></svg>
              </button>

              {sel === p.key && (
                <div className="border-t border-border/20">
                  {loading ? (
                    <div className="p-4 text-xs text-muted-foreground animate-pulse text-center">Fetching from mainnet...</div>
                  ) : txs.length === 0 ? (
                    <div className="p-4 text-xs text-muted-foreground text-center">
                      No parseable txs found. <button onClick={() => loadProto(p.key)} className="text-gold">Retry</button>
                    </div>
                  ) : txs.map((tx, i) => {
                    const r = tx.ru.find(x => x.p === plan);
                    return (
                      <div key={i} className="px-4 py-2 border-b border-border/10 last:border-0 hover:bg-accent text-xs">
                        <div className="flex justify-between mb-1">
                          <a href={`https://solscan.io/tx/${tx.sig}`} target="_blank" rel="noreferrer" className="font-mono text-[10px] text-muted-foreground hover:text-gold">{tx.sig.slice(0, 12)}...</a>
                          {tx.time && <span className="text-[10px] text-muted-foreground">{new Date(tx.time * 1000).toLocaleTimeString()}</span>}
                        </div>
                        <div className="flex gap-4">
                          <span><span className="text-muted-foreground">Value</span> <b>${tx.value}</b></span>
                          <span><span className="text-muted-foreground">Gas</span> {tx.fee} SOL</span>
                          <span className={r?.sk ? "text-muted-foreground" : "text-gold font-bold"}>{r?.sk ? "skip" : `+$${r?.ru.toFixed(2)}`}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="px-4 py-1 bg-secondary/20 text-[9px] text-muted-foreground font-mono truncate">{p.pid}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-6">Live from Solana mainnet. Quotes via Jupiter. Round-ups match the SDK.</p>
      </div>
    </div>
  );
}
