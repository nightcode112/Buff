import {
  DocContent,
  DocH2,
  DocH3,
  DocP,
  DocNote,
} from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browser Extension — Buff Docs",
  description: "Install and use the Buff browser extension to auto round-up every Solana transaction.",
};

export default function ExtensionDocsPage() {
  return (
    <DocContent
      title="Browser Extension"
      description="Auto round-up every Solana transaction with zero code changes. Install the extension and every swap, bid, or transfer gets rounded up."
      badge="Chrome · Firefox · Brave · Edge · Arc"
    >
      <DocH2>How It Works</DocH2>
      <DocP>
        The Buff extension intercepts your wallet&apos;s <code className="text-[13px] font-mono bg-muted px-1.5 py-0.5 rounded">signTransaction()</code> call
        and appends round-up transfer instructions <strong>into the same transaction</strong> before it reaches your wallet for signing.
        You see one Phantom popup with everything — the original swap plus the round-up. One signature, zero friction.
      </DocP>

      <CodeBlock
        filename="Flow"
        lang="text"
        code={`dApp calls wallet.signTransaction(tx)
  → Buff intercepts via Proxy on window.solana
  → Estimates USD value of the transaction
  → Calls buff.finance/api/wrap to get round-up instructions
  → Appends instructions to the same transaction
  → Passes modified tx to the REAL wallet.signTransaction()
  → User signs ONE Phantom popup (original + round-up)
  → Transaction lands onchain with round-up included`}
      />

      <DocNote>
        <strong>Fail-open safety:</strong> If the Buff API is unavailable, times out, or returns an error, your transaction
        goes through completely unmodified. Buff will never block or corrupt a transaction.
      </DocNote>

      <DocH2>Install</DocH2>

      <DocH3>Chrome / Brave / Edge / Arc</DocH3>
      <DocP>
        Option 1: Install from the <a href="https://buff.finance/extension" className="text-gold hover:underline">Buff website</a> (download and load unpacked).
      </DocP>
      <DocP>
        Option 2: Install from the Chrome Web Store (coming soon).
      </DocP>

      <DocH3>Firefox</DocH3>
      <DocP>
        Download the Firefox build from <a href="https://buff.finance/extension" className="text-gold hover:underline">buff.finance/extension</a> and load as a temporary add-on.
      </DocP>

      <DocH3>Manual Install (Developer Mode)</DocH3>
      <CodeBlock
        filename="terminal"
        lang="bash"
        code={`# Clone and build
git clone https://github.com/buff-protocol/buff
cd packages/chrome-extension
npm install
npm run build        # Chrome → dist/
npm run build:firefox  # Firefox → dist-firefox/

# Chrome: go to chrome://extensions → Enable Developer Mode → Load Unpacked → select dist/
# Firefox: go to about:debugging → Load Temporary Add-on → select dist-firefox/manifest.json`}
      />

      <DocH2>Setup</DocH2>
      <DocP>
        After installing, click the Buff icon in your browser toolbar:
      </DocP>

      <DocH3>1. Open a Solana dApp</DocH3>
      <DocP>
        Navigate to any Solana dApp (Jupiter, Raydium, Tensor, Magic Eden, etc.) so the extension can access your wallet provider.
      </DocP>

      <DocH3>2. Connect Wallet</DocH3>
      <DocP>
        Click <strong>Connect Wallet</strong> in the Buff popup. This triggers Phantom (or your wallet) to connect.
        The extension communicates with the wallet on the active page — it never has access to your private keys.
      </DocP>

      <DocH3>3. Sign Authentication</DocH3>
      <DocP>
        Sign the &ldquo;Buff API Authentication&rdquo; message. This generates your API key and derives your
        self-custodial Buff wallet. Both are stored securely in the extension&apos;s sandboxed storage.
      </DocP>

      <DocH3>4. Start Transacting</DocH3>
      <DocP>
        That&apos;s it. Every Solana transaction you make will now include a round-up. Toggle it off anytime from the popup.
      </DocP>

      <DocH2>Popup Dashboard</DocH2>
      <DocP>The popup has 5 tabs:</DocP>

      <DocH3>Home</DocH3>
      <DocP>
        Quick stats: total round-ups invested, count, last round-up time. Shows the on/off toggle and accumulator
        progress toward the next swap threshold.
      </DocP>

      <DocH3>Plan</DocH3>
      <DocP>
        Choose your round-up increment. Each transaction is rounded up to the next multiple of your plan amount:
      </DocP>
      <CodeBlock
        filename="Plans"
        lang="text"
        code={`Seed     $0.50 round-up    5.0% fee
Sprout   $1.00 round-up    3.0% fee    ← default
Tree     $5.00 round-up    1.5% fee
Forest  $10.00 round-up    1.0% fee`}
      />

      <DocH3>Allocate</DocH3>
      <DocP>
        Set your investment allocation. Split round-ups across BTC, ETH, SOL, USDC, and USDT with custom percentages.
        Presets available for common splits.
      </DocP>

      <DocH3>Portfolio</DocH3>
      <DocP>
        View your Buff wallet&apos;s total value, invested assets, pending SOL (accumulating toward the swap threshold),
        and threshold progress.
      </DocP>

      <DocH3>Settings</DocH3>
      <DocP>
        Configure the ceiling (max round-up per transaction), view your wallet addresses, and disconnect.
      </DocP>

      <DocH2>Security Model</DocH2>

      <DocH3>API Key Isolation</DocH3>
      <DocP>
        Your API key is stored in the background service worker and <strong>never touches the page context</strong>.
        Websites cannot read your Buff credentials. All API calls happen in the extension&apos;s isolated background process.
      </DocP>

      <DocH3>Instruction Validation</DocH3>
      <DocP>
        Before appending any instructions, the extension validates that:
      </DocP>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-1 text-[15px] text-foreground/85">
        <li>Every instruction uses <code className="text-[13px] font-mono bg-muted px-1.5 py-0.5 rounded">SystemProgram</code> (SOL transfers only)</li>
        <li>The signer (fromPubkey) matches your connected wallet</li>
        <li>The total round-up amount is within your configured ceiling</li>
      </ul>
      <DocP>
        If any validation fails, the transaction passes through unmodified.
      </DocP>

      <DocH3>Transaction Transparency</DocH3>
      <DocP>
        Every modification is visible in Phantom&apos;s signing popup. You see the original transaction plus
        the two extra SOL transfers (round-up to Buff wallet + fee to treasury) before you approve.
      </DocP>

      <DocH2>Supported Wallets</DocH2>
      <DocP>
        The extension wraps the following wallet providers:
      </DocP>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-1 text-[15px] text-foreground/85">
        <li><strong>Phantom</strong> — <code className="text-[13px] font-mono bg-muted px-1.5 py-0.5 rounded">window.phantom.solana</code> and <code className="text-[13px] font-mono bg-muted px-1.5 py-0.5 rounded">window.solana</code></li>
        <li><strong>Solflare</strong> — <code className="text-[13px] font-mono bg-muted px-1.5 py-0.5 rounded">window.solflare</code></li>
        <li><strong>Backpack</strong> — <code className="text-[13px] font-mono bg-muted px-1.5 py-0.5 rounded">window.backpack</code></li>
      </ul>
      <DocP>
        Both <code className="text-[13px] font-mono bg-muted px-1.5 py-0.5 rounded">signTransaction()</code> and <code className="text-[13px] font-mono bg-muted px-1.5 py-0.5 rounded">signAllTransactions()</code> are intercepted.
        Legacy Transaction and VersionedTransaction (without address lookup tables) are supported.
      </DocP>

      <DocH2>Supported dApps</DocH2>
      <DocP>
        The extension works on <strong>any Solana dApp</strong> — it wraps the wallet provider globally. Tested on:
      </DocP>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-1 text-[15px] text-foreground/85">
        <li>Jupiter (swaps)</li>
        <li>Raydium (swaps, liquidity)</li>
        <li>Tensor (NFT marketplace)</li>
        <li>Magic Eden (NFT marketplace)</li>
        <li>Marinade (staking)</li>
        <li>Any dApp that uses standard Solana wallet adapter</li>
      </ul>

      <DocH2>Edge Cases</DocH2>

      <DocH3>Exact Dollar Amounts</DocH3>
      <DocP>
        If a transaction is already an exact multiple of the plan amount (e.g., exactly $5.00 on the Tree plan),
        the round-up is $0 and skipped. No extra transfers are added.
      </DocP>

      <DocH3>VersionedTransaction with Lookup Tables</DocH3>
      <DocP>
        If a VersionedTransaction uses address lookup tables, the extension cannot safely add accounts and skips
        the round-up for that transaction. This is rare — most Jupiter swaps use lookup tables but the extension
        handles the common cases.
      </DocP>

      <DocH3>Very Small Transactions</DocH3>
      <DocP>
        Transactions estimated under $0.01 USD are skipped automatically.
      </DocP>

      <DocH3>API Timeout</DocH3>
      <DocP>
        The extension times out API requests after 8 seconds and passes the transaction through unmodified.
      </DocP>

      <DocH2>Building from Source</DocH2>
      <CodeBlock
        filename="terminal"
        lang="bash"
        code={`cd packages/chrome-extension
npm install

# Development (watch mode)
npm run dev            # Chrome
npm run dev:firefox    # Firefox

# Production
npm run build          # Chrome → dist/
npm run build:firefox  # Firefox → dist-firefox/
npm run build:all      # Both`}
      />

      <DocH2>Architecture</DocH2>
      <CodeBlock
        filename="Architecture"
        lang="text"
        code={`┌─────────────────────────────────────────────────┐
│  PAGE CONTEXT (inject.ts)                       │
│  Proxies window.solana.signTransaction()        │
│  Estimates tx value, appends instructions       │
├──────────── window.postMessage ─────────────────┤
│  CONTENT SCRIPT (content.ts)                    │
│  Bridge: relays messages both directions        │
├──────────── chrome.runtime.sendMessage ─────────┤
│  SERVICE WORKER (background.ts)                 │
│  API calls, auth, state, instruction validation │
│  API key lives here — never reaches page        │
├──────────── fetch() ────────────────────────────┤
│  BUFF API (buff.finance/api/wrap)               │
│  Calculates round-up, returns instructions      │
└─────────────────────────────────────────────────┘`}
      />
    </DocContent>
  );
}
