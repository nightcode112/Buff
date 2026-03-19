import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buff Browser Extension — Auto Round-Up Investing for Solana",
  description: "Install the Buff browser extension to automatically round up every Solana transaction and invest the spare change into BTC, ETH, SOL, and more.",
};

const PLANS = [
  { name: "Seed", amount: "$0.50", fee: "5%", desc: "Micro round-ups" },
  { name: "Sprout", amount: "$1.00", fee: "3%", desc: "Default tier" },
  { name: "Tree", amount: "$5.00", fee: "1.5%", desc: "Moderate investing" },
  { name: "Forest", amount: "$10.00", fee: "1%", desc: "Power investor" },
];

const STEPS = [
  {
    num: "1",
    title: "Install the extension",
    desc: "Download for Chrome, Firefox, Brave, Edge, or Arc. Load unpacked in developer mode.",
  },
  {
    num: "2",
    title: "Connect your wallet",
    desc: "Open any Solana dApp, click the Buff icon, and connect Phantom, Solflare, or Backpack.",
  },
  {
    num: "3",
    title: "Sign once",
    desc: "Sign the auth message to generate your API key and self-custodial Buff wallet. That's it.",
  },
  {
    num: "4",
    title: "Every transaction invests",
    desc: "Swap on Jupiter, bid on Tensor — every transaction auto-rounds up. One Phantom popup, zero friction.",
  },
];

const FEATURES = [
  {
    title: "One Transaction",
    desc: "Round-up is appended to your existing transaction. One signature. No extra popups.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Any Solana dApp",
    desc: "Works on Jupiter, Raydium, Tensor, Magic Eden — any app that uses a standard Solana wallet.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9" />
      </svg>
    ),
  },
  {
    title: "Self-Custodial",
    desc: "Your Buff wallet is yours. Export the private key to Phantom anytime. We never hold your funds.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
  {
    title: "Fail-Open Safety",
    desc: "If anything goes wrong, your transaction goes through unmodified. Buff never blocks a tx.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Multi-Asset Allocation",
    desc: "Split round-ups across BTC, ETH, SOL, USDC. Set custom percentages for each asset.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    title: "Transparent Fees",
    desc: "Every round-up is visible in your wallet's signing popup. You approve every transaction.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export default function ExtensionPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[72px]">
        {/* Hero */}
        <section className="sky-hero relative overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6 py-24 md:py-32 relative">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold mb-6">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Browser Extension
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Every Solana transaction<br />
                <span className="text-gold">builds your portfolio</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
                Install the Buff extension and every swap, bid, or transfer automatically rounds up
                and invests the spare change. One Phantom popup. Zero friction.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <a
                  href="#install"
                  className="btn-gold px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download Extension
                </a>
                <Link
                  href="/docs/extension"
                  className="btn-outline-luxury px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2"
                >
                  Read the Docs
                </Link>
              </div>

              <p className="text-xs text-muted-foreground">
                Available for Chrome, Brave, Edge, Arc, and Firefox.
              </p>
            </div>

            {/* Floating card mockup */}
            <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2">
              <div className="premium-card rounded-2xl p-6 w-[320px] shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gold">
                        <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="currentColor" opacity="0.3" />
                        <path d="M12 14V22M8 18H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="font-bold">Buff</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider bg-gold/10 text-gold px-2 py-0.5 rounded-full">Sprout</span>
                  </div>
                  <div className="w-9 h-5 rounded-full bg-sage/20 flex items-center justify-end px-0.5">
                    <div className="w-4 h-4 rounded-full bg-sage" />
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Invested</div>
                <div className="text-3xl font-extrabold text-gold mb-1">$47.82</div>
                <div className="text-xs text-muted-foreground mb-4">23 round-ups</div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#F7931A" }} />
                      <span className="font-medium">BTC</span>
                    </div>
                    <span className="text-muted-foreground">$28.69</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#627EEA" }} />
                      <span className="font-medium">ETH</span>
                    </div>
                    <span className="text-muted-foreground">$14.35</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#9945FF" }} />
                      <span className="font-medium">SOL</span>
                    </div>
                    <span className="text-muted-foreground">$4.78</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/30">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Next swap at $5.00</span>
                    <span>68%</span>
                  </div>
                  <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gold/60 rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider-gold" />

        {/* How it works */}
        <section className="py-20">
          <div className="max-w-[1280px] mx-auto px-6">
            <h2 className="text-2xl font-extrabold text-center mb-12">Setup in 4 Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {STEPS.map((step) => (
                <div key={step.num} className="premium-card rounded-2xl p-6 text-center shine-on-hover">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider-gold" />

        {/* Features */}
        <section className="py-20 bg-card">
          <div className="max-w-[1280px] mx-auto px-6">
            <h2 className="text-2xl font-extrabold text-center mb-4">Why Buff Extension</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
              The simplest way to DCA into crypto. No dApp integration needed — works everywhere automatically.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="premium-card rounded-2xl p-6 shine-on-hover">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider-gold" />

        {/* Plans */}
        <section className="py-20">
          <div className="max-w-[1280px] mx-auto px-6">
            <h2 className="text-2xl font-extrabold text-center mb-4">Pick Your Plan</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
              Higher round-up increments mean more invested per transaction and lower fees.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {PLANS.map((p) => (
                <div key={p.name} className={`premium-card rounded-2xl p-6 text-center shine-on-hover ${p.name === "Sprout" ? "ring-2 ring-gold/30" : ""}`}>
                  {p.name === "Sprout" && (
                    <span className="inline-block text-[9px] font-semibold uppercase tracking-wider bg-gold/10 text-gold px-2 py-0.5 rounded-full mb-2">Default</span>
                  )}
                  <h3 className="font-bold mb-1">{p.name}</h3>
                  <div className="text-2xl font-extrabold text-gold mb-1">{p.amount}</div>
                  <div className="text-xs text-muted-foreground mb-1">{p.fee} fee</div>
                  <div className="text-[10px] text-muted-foreground">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider-gold" />

        {/* Download */}
        <section id="install" className="py-20 bg-card">
          <div className="max-w-[1280px] mx-auto px-6 text-center">
            <h2 className="text-2xl font-extrabold mb-4">Download Buff Extension</h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              Currently available as a developer build. Chrome Web Store and Firefox Add-ons listings coming soon.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
              {/* Chrome */}
              <div className="premium-card rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <path d="M21.17 8H12M3.95 6.06L8.54 14M10.88 21.94L15.46 14" />
                  </svg>
                </div>
                <h3 className="font-bold mb-1">Chrome / Brave / Edge / Arc</h3>
                <p className="text-xs text-muted-foreground mb-4">Manifest V3 &middot; Chromium browsers</p>
                <div className="space-y-2">
                  <a
                    href="https://github.com/buff-protocol/buff/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 w-full justify-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Download .zip
                  </a>
                  <p className="text-[10px] text-muted-foreground">
                    Load unpacked at chrome://extensions
                  </p>
                </div>
              </div>

              {/* Firefox */}
              <div className="premium-card rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#FF7139]/10 border border-[#FF7139]/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF7139" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4" />
                    <path d="M16 8c0-1.1-.9-2-2-2" />
                  </svg>
                </div>
                <h3 className="font-bold mb-1">Firefox</h3>
                <p className="text-xs text-muted-foreground mb-4">Manifest V2 &middot; Gecko</p>
                <div className="space-y-2">
                  <a
                    href="https://github.com/buff-protocol/buff/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-luxury px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 w-full justify-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Download .zip
                  </a>
                  <p className="text-[10px] text-muted-foreground">
                    Load at about:debugging
                  </p>
                </div>
              </div>
            </div>

            <div className="premium-card rounded-2xl p-6 max-w-2xl mx-auto text-left">
              <h3 className="font-bold mb-3">Build from Source</h3>
              <div className="bg-[#0c0b10] rounded-xl p-4 font-mono text-sm text-white/80 space-y-1">
                <div><span className="text-muted-foreground">$</span> git clone https://github.com/buff-protocol/buff</div>
                <div><span className="text-muted-foreground">$</span> cd packages/chrome-extension</div>
                <div><span className="text-muted-foreground">$</span> npm install &amp;&amp; npm run build</div>
                <div className="text-muted-foreground"># Load dist/ folder as unpacked extension</div>
              </div>
            </div>

            <div className="mt-10">
              <Link href="/docs/extension" className="text-sm text-gold hover:underline font-medium">
                Full documentation &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
