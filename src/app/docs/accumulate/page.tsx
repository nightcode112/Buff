import {
  DocContent,
  DocH2,
  DocP,
  DocTable,
  DocNote,
} from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function AccumulatePage() {
  return (
    <DocContent
      title="Accumulate & Invest"
      description="Round-ups accumulate in the Buff wallet until the threshold is reached, then swap via the Buff API using Jupiter."
      badge="Core Concept"
    >
      <DocH2>The Flow</DocH2>
      <DocTable
        headers={["Phase", "What happens", "Where"]}
        rows={[
          ["Round-up", "Spare change transferred to Buff wallet", "Per transaction (via getWrapInstructions)"],
          ["Accumulate", "SOL balance grows in Buff wallet", "Automatic"],
          ["Threshold check", "Balance compared to USD threshold", "Via getAccumulator(address)"],
          ["Swap", "SOL swapped to target asset via Jupiter", "Server-side via buildSwap + executeSwap"],
        ]}
      />

      <DocH2>Why Accumulate?</DocH2>
      <DocP>
        Individual round-ups are small ($0.03 - $0.99). Swapping $0.03 worth of
        SOL into BTC would cost more in swap fees than the amount itself. By
        accumulating to $5 (default), the swap is meaningful and cost-efficient.
      </DocP>

      <DocH2>Checking the Balance</DocH2>
      <CodeBlock
        filename="check.ts"
        code={`const state = await buff.getAccumulator(buffWalletPubkey)

console.log(state)
// {
//   balanceSol: 0.034,
//   balanceUsd: 5.10,          // above $5 threshold!
//   thresholdReached: true,
//   solPriceUsd: 150,
// }

if (state.thresholdReached) {
  const { ready, transactions } = await buff.buildSwap(buffWalletPubkey)
  if (ready) {
    for (const tx of transactions) {
      const signed = await signTransaction(tx)
      await buff.executeSwap(signed)
    }
    console.log("Swaps executed!")
  }
}`}
      />

      <DocH2>Configuring the Threshold</DocH2>
      <CodeBlock
        filename="threshold.ts"
        code={`// Set during construction
const buff = new Buff({
  investThreshold: 10,  // wait until $10
  // ...
})

// Or change at runtime
buff.setThreshold(25)  // accumulate more before swapping`}
      />

      <DocH2>Supported Assets</DocH2>
      <DocTable
        headers={["Asset", "Token", "Mainnet Mint"]}
        rows={[
          ["BTC", "wBTC (Portal)", "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"],
          ["ETH", "wETH (Portal)", "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"],
          ["SOL", "Native SOL", "So11111111111111111111111111111111111111112"],
          ["USDC", "USDC", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"],
          ["USDT", "USDT", "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"],
        ]}
      />

      <DocNote>
        Jupiter handles the swap routing automatically — it finds the best
        price across all Solana DEXes. Swap transactions are built server-side
        via buildSwap() — the client only needs to sign and submit them.
        A 0.01 SOL reserve is kept in the Buff wallet for future transaction fees.
      </DocNote>
    </DocContent>
  );
}
