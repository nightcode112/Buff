import {
  DocContent,
  DocP,
  DocNote,
  DocSteps,
  DocStep,
} from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function QuickstartPage() {
  return (
    <DocContent
      title="Quick Start"
      description="Integrate Buff into your Solana application in 5 minutes."
    >
      <DocSteps>
        <DocStep step={1} title="Create a Buff Client">
          <DocP>
            Instantiate the Buff client with your API key and desired
            configuration. For wallet-based auth, call setWalletAuth after
            the user signs the auth message.
          </DocP>
          <CodeBlock
            filename="init.ts"
            code={`import { Buff } from "@buff/sdk"

const buff = new Buff({
  apiKey: "your-api-key",        // or use wallet auth below
  network: "mainnet-beta",       // or "devnet" for testing
  plan: "sprout",                // rounds to nearest $0.10
  investInto: "BTC",             // auto-buy Bitcoin
  investThreshold: 5,            // swap when $5 accumulated
})

// Optional: wallet-based auth instead of API key
const authMsg = await buff.getAuthMessage()
const signature = await wallet.signMessage(authMsg)
buff.setWalletAuth(wallet.publicKey.toBase58(), signature)

// Derive the user's Buff wallet (server-side derivation)
const buffWallet = await buff.deriveWallet(signature)
console.log("Buff wallet:", buffWallet)`}
          />
        </DocStep>

        <DocStep step={2} title="Get Wrap Instructions">
          <DocP>
            When your user makes a transaction, get the round-up transfer
            instructions from the server. Add them to your transaction before
            signing. All fee calculation happens server-side.
          </DocP>
          <CodeBlock
            filename="wrap.ts"
            code={`// Get round-up instructions for the transaction value
const { instructions, breakdown } = await buff.getWrapInstructions(
  47.83, userPubkey, buffWalletPubkey
)

console.log("Round-up:", breakdown.roundUpUsd)           // $0.17
console.log("User invests:", breakdown.userInvestmentUsd) // $0.1687
console.log("Buff fee:", breakdown.buffFeeUsd)            // $0.0013
console.log("Skipped:", breakdown.skipped)                // false

// Add instructions to your existing transaction
const tx = new Transaction()
tx.add(/* your swap/mint/transfer instruction */)
for (const ix of instructions) tx.add(ix)

// Sign and send the wrapped transaction as usual
await sendTransaction(tx)`}
          />
        </DocStep>

        <DocStep step={3} title="Check Accumulator & Swap">
          <DocP>
            After each transaction, check the accumulated balance. When the
            threshold is reached, build and execute swap transactions via the
            server.
          </DocP>
          <CodeBlock
            filename="invest.ts"
            code={`// Check accumulator state
const state = await buff.getAccumulator(buffWalletPubkey)

if (state.thresholdReached) {
  // Build swap transactions server-side
  const { ready, transactions } = await buff.buildSwap(buffWalletPubkey)

  if (ready) {
    // Sign and execute each swap transaction
    for (const txBase64 of transactions) {
      const signed = await wallet.signTransaction(txBase64)
      await buff.executeSwap(signed)
    }
    console.log("Swaps executed!")
  }
} else {
  console.log("Accumulated:", state.balanceUsd, "/ $", state.thresholdUsd)
}`}
          />
        </DocStep>

        <DocStep step={4} title="View Portfolio">
          <CodeBlock
            filename="portfolio.ts"
            code={`const portfolio = await buff.getPortfolio(buffWalletPubkey)

console.log("Total value:", portfolio.totalUsd)
console.log("Pending SOL:", portfolio.pendingSol)
console.log("Balances:", portfolio.balances)
// [{ asset: "BTC", usdValue: 48.20, balance: "0.00068" }]`}
          />
        </DocStep>

        <DocStep step={5} title="Explore Plans & Prices">
          <CodeBlock
            filename="plans.ts"
            code={`// Get available plans and their details
const plans = await buff.getPlans()
console.log(plans)
// [{ tier: "seed", roundToUsd: 0.05, feePercent: 1.00 }, ...]

// Get current asset prices
const prices = await buff.getPrices()
console.log(prices)
// { SOL: 150.00, BTC: 71000, ETH: 2100, ... }

// Calculate a round-up without wrapping
const breakdown = await buff.calculateRoundUp(27.63)
console.log(breakdown)
// { roundUpUsd: 0.37, userInvestmentUsd: 0.3672, ... }`}
          />
        </DocStep>
      </DocSteps>

      <DocNote>
        The Buff wallet is derived server-side from the user&apos;s signature.
        The treasury address and fee logic are never exposed to the client.
        All swap routing and execution is handled by the Buff API.
      </DocNote>
    </DocContent>
  );
}
