import { DocContent, DocH2, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function InvestPage() {
  return (
    <DocContent title="buff.checkAndInvest()" description="Check accumulated balance and auto-swap to target asset when threshold is reached." badge="API">
      <DocH2>Signature</DocH2>
      <CodeBlock filename="types.ts" code={`async checkAndInvest(): Promise<{
  state: AccumulatorState
  swaps: SwapResult[]     // one per allocation
  quotes: SwapQuote[]     // one per allocation
  swap: SwapResult | null // first swap (backward compat)
  quote: SwapQuote | null // first quote (backward compat)
}>`} />

      <DocH2>AccumulatorState</DocH2>
      <CodeBlock filename="types.ts" code={`interface AccumulatorState {
  balanceSol: number       // Buff wallet SOL balance
  balanceUsd: number       // In USD (real-time price)
  roundUpCount: number     // Round-ups since last swap
  thresholdReached: boolean
  thresholdUsd: number     // Configured threshold
  solPriceUsd: number      // Current SOL price
}`} />

      <DocH2>SwapResult (when threshold reached)</DocH2>
      <CodeBlock filename="types.ts" code={`interface SwapResult {
  txSignature: string  // Solana tx signature
  inputSol: number     // SOL amount swapped
  asset: SupportedAsset // Target asset (BTC, ETH, etc.)
  timestamp: number    // Unix timestamp
}`} />

      <DocH2>Example</DocH2>
      <CodeBlock filename="invest.ts" code={`// Call after each wrap()
const { state, swaps, quotes } = await buff.checkAndInvest()

if (!state.thresholdReached) {
  console.log("Accumulated: $" + state.balanceUsd.toFixed(2))
  console.log("Need: $" + (state.thresholdUsd - state.balanceUsd).toFixed(2))
  return
}

// Multi-asset: one swap per allocation
for (let i = 0; i < swaps.length; i++) {
  console.log(swaps[i].inputSol + " SOL → " + swaps[i].asset)
  console.log("Route: " + quotes[i]?.route)
}
// e.g. with allocations [{BTC:60},{ETH:40}]:
// 0.030 SOL → BTC
// 0.020 SOL → ETH`} />

      <DocNote>A 0.01 SOL reserve is kept in the Buff wallet for future transaction fees. The swap is executed via Jupiter with automatic route finding.</DocNote>

      <DocH2>Preview Without Executing</DocH2>
      <CodeBlock filename="quote.ts" code={`// Get a quote without swapping
const quote = await buff.getQuote()

if (quote) {
  console.log("Would swap:", quote.inputSol, "SOL")
  console.log("Expected output:", quote.expectedOutput)
  console.log("Route:", quote.route)
}`} />
    </DocContent>
  );
}
