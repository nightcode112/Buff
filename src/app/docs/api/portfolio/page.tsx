import { DocContent, DocH2, DocP, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function PortfolioPage() {
  return (
    <DocContent title="buff.getPortfolio()" description="Read all token balances and USD values from the Buff wallet." badge="API">
      <DocH2>Signature</DocH2>
      <CodeBlock filename="types.ts" code={`async getPortfolio(): Promise<Portfolio>

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
  decimals: number
  usdValue: number
}`} />

      <DocH2>Example</DocH2>
      <CodeBlock filename="portfolio.ts" code={`const portfolio = await buff.getPortfolio()

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
      <CodeBlock filename="methods.ts" code={`// Get the Buff wallet address
buff.getWalletAddress()
// "E71R6Ph2sS4eYJVSNLacorUtSDNK1rUixVswgFD5hCY3"

// Export private key (for Phantom import)
const key = buff.exportKey()
// Uint8Array(64)

// Get lifetime stats
const stats = buff.getStats()
// { totalRoundUps: 142, totalInvestedUsd: 48.20, ... }

// Preview fees without wrapping
const preview = await buff.previewFees(27.63)
// { roundUpUsd: 0.37, userInvestmentUsd: 0.3672, ... }`} />

      <DocNote>Portfolio values are fetched in real-time from the Solana blockchain with live USD prices from CoinGecko. Prices are cached for 30 seconds.</DocNote>
    </DocContent>
  );
}
