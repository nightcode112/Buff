import { DocContent, DocH2, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function ErrorsPage() {
  return (
    <DocContent title="Error Handling" description="Handle API errors gracefully in your Buff integration." badge="API">
      <DocH2>API Error Format</DocH2>
      <DocP>All Buff API endpoints return a consistent JSON format. On error:</DocP>
      <CodeBlock filename="error-response.json" lang="typescript" code={`{
  "ok": false,
  "error": "Auth required. Use x-api-key OR x-wallet + x-signature headers."
}`} />

      <DocH2>Common Errors</DocH2>
      <DocTable
        headers={["Status", "Error", "Cause"]}
        rows={[
          ["401", "Auth required", "Missing API key or wallet signature"],
          ["403", "Invalid API key / Invalid signature", "Wrong credentials"],
          ["400", "txValueUsd is required", "Missing required field"],
          ["400", "Invalid public key format", "Malformed Solana address"],
          ["400", "Simulation failed", "Transaction would fail on-chain"],
          ["400", "Insufficient balance after rent exemption", "Not enough SOL for swap"],
          ["429", "Rate limited", "Too many requests (60/min per IP)"],
          ["500", "Transaction failed", "On-chain execution error"],
          ["502", "Jupiter quote failed", "Jupiter API unavailable"],
        ]}
      />

      <DocH2>Catching Errors</DocH2>
      <CodeBlock filename="errors.ts" code={`import { Buff } from "buff-protocol-sdk"

const buff = new Buff({ apiKey: "YOUR_KEY" })

try {
  const result = await buff.buildSwap(buffWalletPubkey)
  if (result.ready) {
    for (const tx of result.transactions) {
      await buff.executeSwap(signedTx)
    }
  }
} catch (err) {
  if (err instanceof Error) {
    // All SDK errors are plain Error instances
    // The message contains the API error string
    console.error("Buff error:", err.message)

    // Common patterns:
    if (err.message.includes("Auth required")) {
      // Re-authenticate
    }
    if (err.message.includes("Rate limited")) {
      // Back off and retry
    }
    if (err.message.includes("Jupiter")) {
      // Jupiter API issue — retry later
    }
  }
}`} />

      <DocH2>Retry Strategy</DocH2>
      <DocP>Transient failures (network, Jupiter, rate limits) can be retried:</DocP>
      <CodeBlock filename="retry.ts" code={`async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === maxRetries - 1) throw err
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}

// Usage
const result = await withRetry(() => buff.buildSwap(wallet))`} />

      <DocNote>The Buff API handles swap routing retries internally. Client-side retries are only needed for network-level failures (timeouts, connection drops, rate limits).</DocNote>
    </DocContent>
  );
}
