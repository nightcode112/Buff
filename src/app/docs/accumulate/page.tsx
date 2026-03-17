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
      description="Round-ups accumulate in the Buff wallet until the threshold is reached, then auto-swap via Jupiter."
      badge="Core Concept"
    >
      <DocH2>The Flow</DocH2>
      <DocTable
        headers={["Phase", "What happens", "Where"]}
        rows={[
          ["Round-up", "Spare change transferred to Buff wallet", "Per transaction"],
          ["Accumulate", "SOL balance grows in Buff wallet", "Automatic"],
          ["Threshold check", "Balance compared to USD threshold", "After each wrap()"],
          ["Swap", "SOL → target asset via Jupiter", "When threshold reached"],
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
        code={`const { state, swap, quote } = await buff.checkAndInvest()

console.log(state)
// {
//   balanceSol: 0.034,
//   balanceUsd: 5.10,          // above $5 threshold!
//   thresholdReached: true,
//   solPriceUsd: 150,
// }

if (swap) {
  console.log("Swapped!", swap.txSignature)
  // Buff wallet now holds BTC (or target asset)
}`}
      />

      <DocH2>Configuring the Threshold</DocH2>
      <CodeBlock
        filename="threshold.ts"
        code={`// Set during init
const buff = await Buff.init({
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
        price across all Solana DEXes. The SDK keeps a 0.01 SOL reserve in
        the Buff wallet for future transaction fees.
      </DocNote>
    </DocContent>
  );
}
