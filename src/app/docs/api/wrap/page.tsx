import { DocContent, DocH2, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function WrapPage() {
  return (
    <DocContent title="buff.wrap()" description="Wrap a Solana transaction with Buff round-up transfer instructions." badge="API">
      <DocH2>Signature</DocH2>
      <CodeBlock filename="types.ts" code={`async wrap(
  transaction: Transaction,
  userPubkey: PublicKey,
  options: { txValueUsd: number }
): Promise<{ transaction: Transaction; breakdown: FeeBreakdown }>`} />

      <DocH2>Parameters</DocH2>
      <DocTable
        headers={["Param", "Type", "Description"]}
        rows={[
          ["transaction", "Transaction", "The original Solana transaction to wrap"],
          ["userPubkey", "PublicKey", "The user's main wallet public key"],
          ["options.txValueUsd", "number", "Total transaction value in USD (the amount being swapped/sent/minted)"],
        ]}
      />

      <DocH2>Returns</DocH2>
      <DocP>The original transaction with two additional instructions appended (if not skipped):</DocP>
      <DocTable
        headers={["Instruction", "Destination", "Amount"]}
        rows={[
          ["Transfer 1", "User's Buff wallet", "Round-up minus Buff fee"],
          ["Transfer 2", "Buff treasury", "Buff platform fee"],
        ]}
      />

      <DocH2>FeeBreakdown</DocH2>
      <CodeBlock filename="breakdown.ts" code={`interface FeeBreakdown {
  txValueUsd: number        // Original tx value
  roundToUsd: number        // Plan's increment
  roundedToUsd: number      // Next boundary
  roundUpUsd: number        // Spare change amount
  roundUpSol: number        // Converted to SOL
  buffFeePercent: number     // Buff fee rate
  buffFeeUsd: number         // Buff takes
  buffFeeSol: number         // In SOL
  userInvestmentUsd: number // User gets
  userInvestmentSol: number // In SOL
  skipped: boolean          // true if exact match
  capped: boolean           // true if ceiling applied
}`} />

      <DocH2>Example</DocH2>
      <CodeBlock filename="wrap.ts" code={`const tx = new Transaction()
tx.add(/* your swap instruction */)

const { transaction, breakdown } = await buff.wrap(tx, userPubkey, {
  txValueUsd: 47.83
})

if (breakdown.skipped) {
  console.log("Exact dollar — no round-up")
} else {
  console.log("Round-up: $" + breakdown.roundUpUsd)
  console.log("Instructions added:", transaction.instructions.length)
}

// Sign and send as usual
await sendTransaction(transaction)`} />

      <DocNote>If the transaction value is an exact multiple of the plan increment (e.g. $2.00 on Sprout), wrap() returns the original transaction unchanged with skipped: true.</DocNote>
    </DocContent>
  );
}
