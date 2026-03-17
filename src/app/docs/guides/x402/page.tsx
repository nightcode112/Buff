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
        Buff&apos;s <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">createX402Fetch()</code>{" "}
        wraps the standard <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">fetch</code> API.
        When a server responds with 402, it pays the requested amount and
        automatically records a Buff round-up on top.
      </DocP>

      <DocH2>Basic Usage</DocH2>
      <CodeBlock
        filename="x402-fetch.ts"
        code={`import { Buff, createX402Fetch } from "@buff/sdk"

const buff = await Buff.init({ agentKeypair, platformId: "my-agent" })
const x402Fetch = createX402Fetch(buff, {
  autoPay: true,
  maxPaymentUsd: 1.00,
})

// Use like normal fetch — auto-pays 402 responses
const res = await x402Fetch("https://api.example.com/data")
// If 402, Buff pays + rounds up automatically

const data = await res.json()
console.log(data)`}
      />

      <DocH2>How It Works</DocH2>
      <DocP>
        When the server returns a 402 response, the x402 client reads the
        payment details from response headers, sends the payment on Solana, then
        retries the request with a payment receipt header. The round-up is
        recorded in the Buff wallet automatically.
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

      <DocH2>Configuration Options</DocH2>
      <CodeBlock
        filename="x402-config.ts"
        code={`const x402Fetch = createX402Fetch(buff, {
  // Auto-pay 402 responses without prompting
  autoPay: true,

  // Maximum amount to pay per request (safety limit)
  maxPaymentUsd: 1.00,

  // Retry the original request after payment (default: true)
  retryAfterPayment: true,

  // Custom callback when payment is made
  onPayment: ({ amountUsd, recipient, txSignature }) => {
    console.log("Paid", amountUsd, "to", recipient)
  },

  // Custom callback when round-up is recorded
  onRoundUp: ({ breakdown }) => {
    console.log("Round-up:", breakdown.roundUpUsd)
  },
})`}
      />

      <DocH2>Manual Payment Handling</DocH2>
      <DocP>
        If you want to inspect 402 responses before paying, set{" "}
        <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">autoPay: false</code> and
        handle the payment yourself.
      </DocP>
      <CodeBlock
        filename="x402-manual.ts"
        code={`const x402Fetch = createX402Fetch(buff, {
  autoPay: false,
  maxPaymentUsd: 5.00,
})

const res = await x402Fetch("https://api.example.com/premium")

if (res.status === 402) {
  const paymentDetails = res.headers.get("X-Payment-Amount")
  console.log("Server wants:", paymentDetails)

  // Approve and retry
  const paid = await x402Fetch("https://api.example.com/premium", {
    x402: { approve: true },
  })
  const data = await paid.json()
}`}
      />

      <DocNote>
        x402 payments go through the same round-up logic as regular
        transactions. If an API call costs $0.30, Buff rounds up to $1.00 and
        invests the $0.70 difference into your chosen asset.
      </DocNote>
    </DocContent>
  );
}
