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
        <DocStep step={1} title="Initialize the SDK">
          <DocP>
            The user signs a message to derive their deterministic Buff wallet.
            Same signature always produces the same wallet — no storage needed.
          </DocP>
          <CodeBlock
            filename="init.ts"
            code={`import { Buff } from "@buff/sdk"

const buff = await Buff.init({
  network: "mainnet-beta",        // or "devnet" for testing
  platformId: "your-platform-id",
  signMessage: (msg) => wallet.signMessage(msg),
  plan: "sprout",                 // rounds to nearest $0.10
  investInto: "BTC",              // auto-buy Bitcoin
  investThreshold: 5,             // swap when $5 accumulated
})

console.log("Buff wallet:", buff.getWalletAddress())`}
          />
        </DocStep>

        <DocStep step={2} title="Wrap Transactions">
          <DocP>
            When your user makes a transaction, wrap it with Buff. The SDK adds
            two transfer instructions — one for the user&apos;s investment, one for
            the Buff platform fee.
          </DocP>
          <CodeBlock
            filename="wrap.ts"
            code={`// Your existing transaction
const tx = new Transaction()
tx.add(/* your swap/mint/transfer instruction */)

// Wrap with Buff — pass the total tx value in USD
const { transaction, breakdown } = await buff.wrap(tx, userPubkey, {
  txValueUsd: 47.83
})

console.log("Round-up:", breakdown.roundUpUsd)           // $0.17
console.log("User invests:", breakdown.userInvestmentUsd) // $0.1687
console.log("Buff fee:", breakdown.buffFeeUsd)              // $0.0013
console.log("Skipped:", breakdown.skipped)                // false

// Sign and send the wrapped transaction as usual
await sendTransaction(transaction)`}
          />
        </DocStep>

        <DocStep step={3} title="Check & Auto-Invest">
          <DocP>
            After each transaction, check if the accumulated balance has
            reached the threshold. If yes, Buff swaps to the target asset via
            Jupiter.
          </DocP>
          <CodeBlock
            filename="invest.ts"
            code={`const { state, swap, quote } = await buff.checkAndInvest()

if (swap) {
  console.log("Swapped!", swap.txSignature)
  console.log("Input:", swap.inputSol, "SOL →", swap.asset)
} else {
  console.log("Accumulated:", state.balanceUsd, "/ $", state.thresholdUsd)
}`}
          />
        </DocStep>

        <DocStep step={4} title="View Portfolio">
          <CodeBlock
            filename="portfolio.ts"
            code={`const portfolio = await buff.getPortfolio()

console.log("Total value:", portfolio.totalUsd)
console.log("Pending SOL:", portfolio.pendingSol)
console.log("Balances:", portfolio.balances)
// [{ asset: "BTC", usdValue: 48.20, balance: "0.00068" }]

// User can export their wallet to Phantom
const privateKey = buff.exportKey()`}
          />
        </DocStep>

        <DocStep step={5} title="Listen for Events">
          <CodeBlock
            filename="events.ts"
            code={`buff.events.on("roundUp", ({ breakdown, roundUpCount }) => {
  showToast("Invested $" + breakdown.roundUpUsd.toFixed(2))
})

buff.events.on("thresholdReached", ({ state }) => {
  showToast("Swapping " + state.balanceSol + " SOL → BTC")
})

buff.events.on("swapExecuted", ({ result }) => {
  showToast("Bought " + result.asset + "!")
})

buff.events.on("skipped", ({ txValueUsd }) => {
  // Exact dollar amount — no round-up
})`}
          />
        </DocStep>
      </DocSteps>

      <DocNote>
        The Buff wallet is fully non-custodial. Users can export the private
        key at any time and import it into Phantom, Solflare, or any Solana
        wallet. Buff never has access to the funds.
      </DocNote>
    </DocContent>
  );
}
