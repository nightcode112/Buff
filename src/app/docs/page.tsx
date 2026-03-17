import {
  DocContent,
  DocH2,
  DocP,
  DocList,
  DocNote,
  DocTable,
} from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function DocsPage() {
  return (
    <DocContent
      title="Buff SDK"
      description="Round up every Solana transaction and auto-invest the spare change into crypto assets. Like Acorns, but onchain."
      badge="v1.0.0"
    >
      <DocH2>What is Buff?</DocH2>
      <DocP>
        Buff is a thin TypeScript API client that integrates into any Solana application. When
        your users make a transaction, Buff rounds up the total value to the
        nearest increment and invests the spare change into crypto assets like
        BTC, ETH, or SOL. All fee logic and swap execution happens server-side.
      </DocP>

      <DocList
        items={[
          "Round up every transaction — users build portfolios passively",
          "Four plan tiers — from $0.05 to $1.00 round-up increments",
          "Non-custodial — deterministic wallet derived from user's signature via API",
          "Auto-invest via Jupiter — server-side swaps when threshold is reached",
          "Works in browser and Node.js — thin API client, no native dependencies",
        ]}
      />

      <DocH2>Quick Install</DocH2>
      <InstallCommand command="npm install @buff/sdk" />

      <DocH2>5-Line Integration</DocH2>
      <CodeBlock
        filename="app.ts"
        code={`import { Buff } from "@buff/sdk"

const buff = new Buff({
  apiKey: "your-api-key",
  plan: "sprout",
  investInto: "BTC",
})

// Get wrap instructions — Buff calculates round-up server-side
const { instructions, breakdown } = await buff.getWrapInstructions(
  27.63, userPubkey, buffWalletPubkey
)

// breakdown.roundUpUsd = $0.37 (rounds $27.63 → $28.00)
// breakdown.userInvestmentUsd = $0.3672
// breakdown.buffFeeUsd = $0.0028`}
      />

      <DocH2>How It Works</DocH2>
      <DocTable
        headers={["Step", "What happens"]}
        rows={[
          ["1. User transacts", "Swap, mint, stake — any Solana action"],
          [
            "2. Buff rounds up",
            "Total tx value rounded to nearest plan increment (server-side calculation)",
          ],
          [
            "3. Spare change accumulates",
            "Round-ups collect in user's Buff wallet",
          ],
          [
            "4. Threshold hit",
            "When $5+ accumulated, server builds swap transactions via Jupiter",
          ],
          [
            "5. Portfolio grows",
            "User can view holdings via getPortfolio(address)",
          ],
        ]}
      />

      <DocH2>Plan Tiers</DocH2>
      <DocTable
        headers={["Plan", "Rounds to", "Buff Fee", "Example ($1.52 tx)"]}
        rows={[
          ["Seed", "$0.05", "1.00%", "$1.52 → $1.55 = $0.03"],
          ["Sprout", "$0.10", "0.75%", "$1.52 → $1.60 = $0.08"],
          ["Tree", "$0.50", "0.50%", "$1.52 → $2.00 = $0.48"],
          ["Forest", "$1.00", "0.25%", "$1.52 → $2.00 = $0.48"],
        ]}
      />

      <DocNote>
        Exact dollar amounts (e.g. $2.00 with $0.50 increment) are skipped
        entirely — no charge, no round-up. The ceiling is $1.00 max per
        transaction. All fee calculations happen server-side — the treasury
        address is never exposed to the client.
      </DocNote>

      <DocH2>Architecture</DocH2>
      <CodeBlock
        filename="architecture"
        lang="bash"
        showLineNumbers={false}
        code={`@buff/sdk (thin API client)
├── buff.ts           Main class — constructor, config, API calls
├── auth.ts           API key or wallet signature auth
├── roundup.ts        calculateRoundUp → server-side breakdown
├── wrap.ts           getWrapInstructions → transfer instructions
├── portfolio.ts      getPortfolio(address) → token balances
├── accumulator.ts    getAccumulator(address) → balance + threshold
├── swap.ts           getSwapQuote, buildSwap, executeSwap
├── wallet.ts         deriveWallet(signature) → server-side derivation
├── plans.ts          getPlans, getPrices
├── agent.ts          registerAgent, API key auth for agents
└── errors.ts         BuffApiError, BuffAuthError, etc.`}
      />
    </DocContent>
  );
}
