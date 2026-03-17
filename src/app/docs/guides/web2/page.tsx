import {
  DocContent,
  DocH2,
  DocP,
  DocNote,
  DocList,
  DocTable,
} from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function Web2BridgePage() {
  return (
    <DocContent
      title="Web2 Bridge"
      description="Round up fiat and traditional payments into crypto investments via the REST API."
      badge="Guide"
    >
      <DocH2>Overview</DocH2>
      <DocP>
        Not every payment happens on Solana. The Web2 Bridge lets you record
        round-ups from fiat transactions — credit card purchases, Stripe
        payments, invoices — and accumulate them in a Buff wallet for
        auto-investment into crypto.
      </DocP>

      <DocH2>REST API Approach</DocH2>
      <DocP>
        Send a POST request to the round-up endpoint with the transaction value.
        Buff calculates the round-up and records it against the API key&apos;s
        associated wallet.
      </DocP>
      <CodeBlock
        filename="roundup.sh"
        lang="bash"
        code={`curl -X POST https://buff.finance/api/roundup \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-key" \\
  -d '{"txValueUsd": 4.73, "plan": "sprout"}'`}
      />
      <DocP>
        The response includes the round-up breakdown:
      </DocP>
      <CodeBlock
        filename="response.json"
        lang="typescript"
        code={`{
  "roundUpUsd": 0.27,
  "userInvestmentUsd": 0.2679,
  "buffFeeUsd": 0.0021,
  "accumulatedUsd": 3.42,
  "thresholdUsd": 5.00,
  "skipped": false
}`}
      />

      <DocH2>API Parameters</DocH2>
      <DocTable
        headers={["Field", "Type", "Description"]}
        rows={[
          ["txValueUsd", "number", "The fiat transaction amount in USD"],
          ["plan", "string", "Round-up plan: \"seed\", \"sprout\", \"tree\", or \"forest\""],
          ["source", "string", "Optional tag (e.g. \"stripe\", \"shopify\")"],
          ["userId", "string", "Optional user identifier for multi-user platforms"],
        ]}
      />

      <DocH2>Stripe Webhook Pattern</DocH2>
      <DocP>
        The most common Web2 integration is listening for Stripe
        payment events and recording round-ups for each successful charge.
      </DocP>
      <CodeBlock
        filename="stripe-webhook.ts"
        code={`import Stripe from "stripe"

// In your webhook handler (e.g. /api/webhooks/stripe)
export async function POST(req: Request) {
  const event = stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature")!,
    process.env.STRIPE_WEBHOOK_SECRET!,
  )

  if (event.type === "charge.succeeded") {
    const charge = event.data.object as Stripe.Charge
    const amountUsd = charge.amount / 100

    // Record the round-up via Buff REST API
    await fetch("https://buff.finance/api/roundup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.BUFF_API_KEY!,
      },
      body: JSON.stringify({
        txValueUsd: amountUsd,
        plan: "sprout",
        source: "stripe",
        userId: charge.customer as string,
      }),
    })
  }

  return new Response("ok")
}`}
      />

      <DocH2>Use Cases</DocH2>
      <DocList
        items={[
          "E-commerce: round up every Stripe/Shopify checkout into BTC savings",
          "SaaS: round up subscription payments for your users automatically",
          "Invoicing: round up freelancer payments when invoices are paid",
          "POS systems: round up in-store purchases via your payment processor webhook",
        ]}
      />

      <DocH2>Fiat On-Ramp with Changelly</DocH2>
      <DocP>
        Users can fund their Buff wallet directly with fiat currency using
        Changelly. No business entity required — just create an account and
        embed. Users buy SOL with credit card, it deposits directly into their
        Buff wallet. From there, round-ups auto-invest into chosen assets.
      </DocP>
      <CodeBlock
        filename="onramp-link.ts"
        code={`// Generate a Changelly buy link for a user's Buff wallet
const buyUrl = "https://changelly.com/buy/sol?to=" + buffWalletAddress;

// Open in new tab or embed
window.open(buyUrl, "_blank");`}
      />

      <DocH2>Email Signup Flow</DocH2>
      <DocP>
        For users who don&apos;t have a Solana wallet yet, the Buff Dashboard
        supports an email-based signup flow. Users provide their email address,
        and a Buff wallet is derived deterministically from their credentials.
        Once signed up, they can fund via MoonPay and start accumulating
        round-ups immediately — no browser extension or seed phrase required.
      </DocP>
      <DocList
        items={[
          "User enters their email on the Buff signup page",
          "A unique Buff wallet is derived and associated with the account",
          "User funds the wallet using the MoonPay on-ramp widget",
          "Round-ups accumulate and auto-invest into BTC, ETH, or other assets",
          "The wallet private key can be exported at any time to a standard Solana wallet",
        ]}
      />

      <DocNote>
        The REST API is rate-limited to 100 requests per minute per API key.
        For high-volume integrations, batch round-ups or contact us for
        increased limits.
      </DocNote>
    </DocContent>
  );
}
