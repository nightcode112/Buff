import { DocContent, DocH2, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function InvestPage() {
  return (
    <DocContent title="Accumulate & Swap" description="Check accumulated balance, get swap quotes, build and execute swaps — all via the Buff API." badge="API">
      <DocH2>Get Accumulator State</DocH2>
      <CodeBlock filename="types.ts" code={`async getAccumulator(address: string): Promise<AccumulatorState>

interface AccumulatorState {
  balanceSol: number       // Buff wallet SOL balance
  balanceUsd: number       // In USD (real-time price)
  remaining: number        // USD remaining until threshold
  thresholdReached: boolean
  thresholdUsd: number     // Configured threshold
  solPriceUsd: number      // Current SOL price
}`} />

      <DocH2>Get Swap Quote</DocH2>
      <CodeBlock filename="types.ts" code={`async getSwapQuote(
  inputLamports: number,
  targetAsset: SupportedAsset
): Promise<SwapQuote>

interface SwapQuote {
  inputSol: number
  expectedOutput: string
  route: string
  priceImpact: number
}`} />

      <DocH2>Build & Execute Swaps</DocH2>
      <CodeBlock filename="types.ts" code={`// Build swap transactions server-side
async buildSwap(buffWalletPubkey: string): Promise<{
  ready: boolean
  transactions: string[]  // base64-encoded transactions
}>

// Execute a signed swap transaction
async executeSwap(signedTxBase64: string): Promise<{
  txSignature: string
  confirmed: boolean
}>`} />

      <DocH2>Example</DocH2>
      <CodeBlock filename="invest.ts" code={`// Check accumulator state
const state = await buff.getAccumulator(buffWalletPubkey)

if (!state.thresholdReached) {
  console.log("Accumulated: $" + state.balanceUsd.toFixed(2))
  console.log("Need: $" + (state.thresholdUsd - state.balanceUsd).toFixed(2))
  return
}

// Build swap transactions (server handles routing via Jupiter)
const { ready, transactions } = await buff.buildSwap(buffWalletPubkey)

if (ready) {
  for (const txBase64 of transactions) {
    // Sign the transaction with the Buff wallet
    const signed = await signTransaction(txBase64)
    const result = await buff.executeSwap(signed)
    console.log("Swapped →", result.asset, "tx:", result.txSignature)
  }
}`} />

      <DocNote>All swap routing happens server-side via Jupiter. The client only signs and submits the pre-built transactions. A 0.01 SOL reserve is kept in the Buff wallet for future transaction fees.</DocNote>

      <DocH2>Preview a Swap Quote</DocH2>
      <CodeBlock filename="quote.ts" code={`// Get a swap quote without executing
const quote = await buff.getSwapQuote(50000000, "BTC") // 0.05 SOL in lamports

console.log("Would swap:", quote.inputSol, "SOL")
console.log("Expected output:", quote.expectedOutput)
console.log("Route:", quote.route)
console.log("Price impact:", quote.priceImpact + "%")`} />
    </DocContent>
  );
}
