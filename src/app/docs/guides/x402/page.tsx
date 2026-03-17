import {
  DocContent,
  DocH2,
  DocP,
  DocNote,
  DocTable,
} from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function X402ProtocolPage() {
  return (
    <DocContent
      title="x402 Protocol"
      description="Auto-pay HTTP 402 responses and round up every machine-to-machine payment."
      badge="Guide"
    >
      <DocH2>What is x402?</DocH2>
      <DocP>
        HTTP status 402 (&quot;Payment Required&quot;) was reserved for future use since
        HTTP/1.1. The x402 protocol gives it a purpose: servers respond with 402
        and a payment address, and compliant clients pay automatically. This
        enables machine-to-machine payments for APIs, data feeds, and AI tool
        calls without API keys or subscriptions.
      </DocP>
      <DocP>
        In Buff v1.0.0, x402 payments go through REST API endpoints instead of a
        client-side <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">createX402Fetch()</code> wrapper.
        The API handles payment, round-up calculation, and investment logic server-side.
      </DocP>

      <DocH2>Basic Usage</DocH2>
      <CodeBlock
        filename="x402-flow.ts"
        code={`import { Buff } from "buff-protocol-sdk"

const buff = new Buff({
  apiKey: "your-api-key",
  plan: "sprout",
  investInto: "BTC",
})

// 1. Make a request to an x402-enabled API
const res = await fetch("https://api.example.com/data")

if (res.status === 402) {
  // 2. Read payment details from 402 response headers
  const paymentAddress = res.headers.get("X-Payment-Address")
  const amountUsd = parseFloat(res.headers.get("X-Payment-Amount") || "0")

  // 3. Calculate round-up via Buff
  const breakdown = await buff.calculateRoundUp(amountUsd)
  console.log("Payment:", amountUsd, "Round-up:", breakdown.roundUpUsd)

  // 4. Get wrap instructions (transfers payment + round-up)
  const { instructions } = await buff.getWrapInstructions(
    amountUsd, agentPubkey, buffWalletPubkey
  )

  // 5. Build, sign, and send the transaction
  // ... add instructions to transaction, sign, send ...

  // 6. Retry the request with payment receipt
  const paid = await fetch("https://api.example.com/data", {
    headers: { "X-Payment-Receipt": txSignature, "X-Payment-Payer": agentPubkey },
  })
  const data = await paid.json()
}`}
      />

      <DocH2>How It Works</DocH2>
      <DocP>
        When the server returns a 402 response, your code reads the payment
        details from response headers, uses the Buff SDK to calculate the
        round-up and get transfer instructions, sends the payment on Solana,
        then retries the request with a payment receipt header. The round-up
        accumulates in the Buff wallet and auto-invests at threshold.
      </DocP>

      <DocH2>x402 Headers</DocH2>
      <DocTable
        headers={["Header", "Direction", "Description"]}
        rows={[
          ["X-Payment-Address", "Response (402)", "Solana address to pay"],
          ["X-Payment-Amount", "Response (402)", "Amount in lamports or USD"],
          ["X-Payment-Currency", "Response (402)", "\"SOL\" or \"USD\""],
          ["X-Payment-Network", "Response (402)", "\"solana\" (mainnet or devnet)"],
          ["X-Payment-Receipt", "Request (retry)", "Transaction signature proving payment"],
          ["X-Payment-Payer", "Request (retry)", "Payer public key"],
        ]}
      />

      <DocH2>Agent x402 Flow</DocH2>
      <DocP>
        For AI agents making frequent x402 payments, combine the Buff SDK with
        your agent&apos;s transaction signing to handle payments automatically.
      </DocP>
      <CodeBlock
        filename="x402-agent.ts"
        code={`import { Buff } from "buff-protocol-sdk"

const buff = new Buff({
  apiKey: process.env.BUFF_API_KEY,
  plan: "tree",
  investInto: "BTC",
  investThreshold: 5,
})

async function x402Fetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, opts)

  if (res.status !== 402) return res

  const amountUsd = parseFloat(res.headers.get("X-Payment-Amount") || "0")
  const payTo = res.headers.get("X-Payment-Address")

  // Get Buff wrap instructions (includes round-up transfer)
  const { instructions, breakdown } = await buff.getWrapInstructions(
    amountUsd, agentPubkey, buffWalletPubkey
  )

  // Build and send the payment transaction
  const tx = buildTransaction(instructions, payTo, amountUsd)
  const signed = signWithAgentKey(tx)
  const txSig = await sendTransaction(signed)

  // Check if ready to swap accumulated round-ups
  const { ready, transactions } = await buff.buildSwap(buffWalletPubkey)
  if (ready) {
    for (const swapTx of transactions) {
      await buff.executeSwap(signAndSerialize(swapTx))
    }
  }

  // Retry with receipt
  return fetch(url, {
    ...opts,
    headers: {
      ...opts?.headers,
      "X-Payment-Receipt": txSig,
      "X-Payment-Payer": agentPubkey,
    },
  })
}`}
      />

      <DocNote>
        x402 payments go through the same round-up logic as regular
        transactions. If an API call costs $0.30, Buff rounds up to $1.00 and
        invests the $0.70 difference into your chosen asset. All fee logic is
        handled server-side via the buff.finance API.
      </DocNote>
    </DocContent>
  );
}
