import { DocContent, DocH2, DocP, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function PortfolioPage() {
  return (
    <DocContent title="buff.getPortfolio()" description="Read all token balances and USD values for a Buff wallet address." badge="API">
      <DocH2>Signature</DocH2>
      <CodeBlock filename="types.ts" code={`async getPortfolio(address: string): Promise<Portfolio>

interface Portfolio {
  walletAddress: string
  balances: TokenBalance[]
  totalUsd: number      // Total invested assets value
  pendingSol: number    // SOL waiting for threshold
  pendingUsd: number    // In USD
  solPriceUsd: number   // Current SOL price
}

interface TokenBalance {
  asset: SupportedAsset
  mint: string
  balance: string       // Human-readable amount
  usdValue: number
}`} />

      <DocH2>Example</DocH2>
      <CodeBlock filename="portfolio.ts" code={`const portfolio = await buff.getPortfolio(buffWalletPubkey)

console.log("Wallet:", portfolio.walletAddress)
console.log("Total invested:", "$" + portfolio.totalUsd.toFixed(2))
console.log("Pending SOL:", portfolio.pendingSol.toFixed(6))
console.log("Pending USD:", "$" + portfolio.pendingUsd.toFixed(2))

for (const balance of portfolio.balances) {
  console.log(balance.asset + ":", balance.balance, "($" + balance.usdValue.toFixed(2) + ")")
}
// BTC: 0.00068 ($48.20)
// ETH: 0.015 ($31.50)`} />

      <DocH2>Other Methods</DocH2>
      <CodeBlock filename="methods.ts" code={`// Derive the Buff wallet address (server-side)
const buffWallet = await buff.deriveWallet(signature)
// "E71R6Ph2sS4eYJVSNLacorUtSDNK1rUixVswgFD5hCY3"

// Get accumulator state
const state = await buff.getAccumulator(buffWalletPubkey)
// { balanceSol: 0.034, balanceUsd: 5.10, thresholdReached: true, ... }

// Get available plans
const plans = await buff.getPlans()
// [{ tier: "seed", roundToUsd: 0.05, feePercent: 1.00 }, ...]

// Get current asset prices
const prices = await buff.getPrices()
// { SOL: 150.00, BTC: 71000, ETH: 2100, ... }

// Preview round-up without wrapping
const breakdown = await buff.calculateRoundUp(27.63)
// { roundUpUsd: 0.37, userInvestmentUsd: 0.3672, ... }`} />

      <DocNote>getPortfolio() now requires a wallet address parameter. Portfolio values are fetched from the Buff API with live USD prices. All calculations happen server-side.</DocNote>
    </DocContent>
  );
}
