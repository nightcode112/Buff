import { DocContent, DocH2, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function WrapPage() {
  return (
    <DocContent title="buff.getWrapInstructions()" description="Get round-up transfer instructions from the Buff API to add to your transaction." badge="API">
      <DocH2>Signature</DocH2>
      <CodeBlock filename="types.ts" code={`async getWrapInstructions(
  txValueUsd: number,
  userPubkey: string,
  buffWalletPubkey: string
): Promise<{ instructions: string[]; breakdown: RoundUpBreakdown }>`} />

      <DocH2>Parameters</DocH2>
      <DocTable
        headers={["Param", "Type", "Description"]}
        rows={[
          ["txValueUsd", "number", "Total transaction value in USD (the amount being swapped/sent/minted)"],
          ["userPubkey", "string", "The user's main wallet public key"],
          ["buffWalletPubkey", "string", "The user's Buff wallet public key (from deriveWallet)"],
        ]}
      />

      <DocH2>Returns</DocH2>
      <DocP>An object with transfer instructions to append to your transaction, plus a breakdown of the round-up calculation. All fee logic is computed server-side — the treasury address is never exposed to the client.</DocP>
      <DocTable
        headers={["Instruction", "Destination", "Amount"]}
        rows={[
          ["Transfer 1", "User's Buff wallet", "Round-up minus Buff fee"],
          ["Transfer 2", "Buff treasury (hidden)", "Buff platform fee"],
        ]}
      />

      <DocH2>RoundUpBreakdown</DocH2>
      <CodeBlock filename="breakdown.ts" code={`interface RoundUpBreakdown {
  txValueUsd: number              // Original tx value
  roundToUsd: number              // Plan's increment
  roundedToUsd: number            // Next boundary
  roundUpUsd: number              // Spare change amount
  buffFeePercent: number          // Buff fee rate
  buffFeeUsd: number              // Buff takes
  userInvestmentUsd: number       // User gets
  roundUpLamports: number         // Total in lamports
  userInvestmentLamports: number  // User portion in lamports
  buffFeeLamports: number         // Fee portion in lamports
  solPriceUsd: number             // SOL price used
  skipped: boolean                // true if exact match
  capped: boolean                 // true if ceiling applied
}`} />

      <DocH2>Calculate Without Wrapping</DocH2>
      <CodeBlock filename="calculate.ts" code={`// Preview the round-up without generating instructions
const breakdown = await buff.calculateRoundUp(47.83)

console.log("Round-up would be: $" + breakdown.roundUpUsd)
console.log("User would invest: $" + breakdown.userInvestmentUsd)
console.log("Buff fee: $" + breakdown.buffFeeUsd)`} />

      <DocH2>Example</DocH2>
      <CodeBlock filename="wrap.ts" code={`const { instructions, breakdown } = await buff.getWrapInstructions(
  47.83, userPubkey, buffWalletPubkey
)

if (breakdown.skipped) {
  console.log("Exact dollar — no round-up")
} else {
  console.log("Round-up: $" + breakdown.roundUpUsd)

  // Add instructions to your transaction
  const tx = new Transaction()
  tx.add(/* your swap instruction */)
  for (const ix of instructions) tx.add(ix)

  // Sign and send as usual
  await sendTransaction(tx)
}`} />

      <DocNote>If the transaction value is an exact multiple of the plan increment (e.g. $2.00 on Sprout), getWrapInstructions() returns empty instructions with skipped: true in the breakdown.</DocNote>
    </DocContent>
  );
}
