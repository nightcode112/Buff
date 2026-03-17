import {
  DocContent,
  DocH2,
  DocH3,
  DocP,
  DocTable,
  DocNote,
} from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function RoundUpsPage() {
  return (
    <DocContent
      title="How Round-Ups Work"
      description="Buff rounds up the total transaction value (not the fee) to the nearest increment defined by the user's plan."
      badge="Core Concept"
    >
      <DocH2>The Model</DocH2>
      <DocP>
        Just like Acorns rounds up your coffee purchase ($3.42 → $4.00, invest
        $0.58), Buff rounds up your onchain transaction value.
      </DocP>
      <DocP>
        The key difference from Acorns: each plan has its own round-up
        increment, so users choose how aggressively they invest.
      </DocP>

      <DocH2>Example: $1.52 Transaction</DocH2>
      <DocTable
        headers={["Plan", "Increment", "Rounds to", "Round-up"]}
        rows={[
          ["Seed", "$0.05", "$1.55", "$0.03"],
          ["Sprout", "$0.10", "$1.60", "$0.08"],
          ["Tree", "$0.50", "$2.00", "$0.48"],
          ["Forest", "$1.00", "$2.00", "$0.48"],
        ]}
      />

      <DocH2>Example: $1.07 Transaction</DocH2>
      <DocTable
        headers={["Plan", "Increment", "Rounds to", "Round-up"]}
        rows={[
          ["Seed", "$0.05", "$1.10", "$0.03"],
          ["Sprout", "$0.10", "$1.10", "$0.03"],
          ["Tree", "$0.50", "$1.50", "$0.43"],
          ["Forest", "$1.00", "$2.00", "$0.93"],
        ]}
      />

      <DocH2>Rules</DocH2>
      <DocH3>Exact Match = Skip</DocH3>
      <DocP>
        If the transaction value is already an exact multiple of the increment,
        the round-up is $0.00 and no charge is applied.
      </DocP>

      <DocH3>Ceiling ($1.00)</DocH3>
      <DocP>
        No single round-up will ever exceed $1.00. If a very small transaction
        with a large increment would produce a round-up above $1.00, it gets
        capped. The ceiling is configurable via the API request.
      </DocP>

      <DocH2>The Math</DocH2>
      <CodeBlock
        filename="round-up.ts"
        code={`// Fixed-point arithmetic to avoid floating point errors
const scale = 1_000_000
const scaledValue = Math.round(txValueUsd * scale)
const scaledRound = Math.round(roundToUsd * scale)
const scaledRemainder = scaledValue % scaledRound

// Exact match
if (scaledRemainder === 0) return { roundUpUsd: 0, skipped: true }

// Round-up amount
const raw = (scaledRound - scaledRemainder) / scale

// Cap at ceiling
if (raw > ceiling) return { roundUpUsd: ceiling, capped: true }

return { roundUpUsd: raw }`}
      />

      <DocNote>
        Buff uses fixed-point math (scaled by 1,000,000) to avoid floating point
        precision errors. For example, 1.00 % 0.10 returns 0.09999... in
        JavaScript, but Buff correctly identifies it as an exact match.
      </DocNote>

      <DocH2>Fee Breakdown</DocH2>
      <DocP>
        After calculating the round-up, Buff splits it into two parts:
      </DocP>
      <DocTable
        headers={["Part", "Destination", "Purpose"]}
        rows={[
          ["Round-up - Buff fee", "User's Buff wallet", "Accumulates until threshold, then swapped to target asset"],
          ["Buff fee (0.25-1.00%)", "Buff treasury", "Platform revenue — tiered by plan"],
        ]}
      />

      <CodeBlock
        filename="preview.ts"
        code={`const breakdown = await buff.calculateRoundUp(27.63)

console.log(breakdown)
// {
//   txValueUsd: 27.63,
//   roundToUsd: 0.10,           // Sprout plan
//   roundedToUsd: 27.70,        // next boundary
//   roundUpUsd: 0.07,           // spare change
//   buffFeePercent: 0.75,
//   buffFeeUsd: 0.000525,        // Buff takes
//   userInvestmentUsd: 0.069475, // user keeps
//   skipped: false,
//   capped: false,
// }`}
      />
    </DocContent>
  );
}
