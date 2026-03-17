import { DocContent, DocH2, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function ErrorsPage() {
  return (
    <DocContent title="Error Handling" description="All SDK errors extend BuffError with structured context for debugging." badge="API">
      <DocH2>Error Types</DocH2>
      <DocTable
        headers={["Error", "When", "Properties"]}
        rows={[
          ["BuffApiError", "API request fails (4xx/5xx)", "endpoint, statusCode, responseBody"],
          ["BuffAuthError", "Missing or invalid API key / wallet auth", "reason"],
          ["BuffSwapError", "Swap build or execution fails", "phase, statusCode, responseBody"],
          ["BuffInsufficientBalanceError", "Not enough SOL for swap", "required, available"],
          ["BuffNetworkError", "Network connection fails", "endpoint"],
        ]}
      />

      <DocH2>Catching Errors</DocH2>
      <CodeBlock filename="errors.ts" code={`import {
  BuffApiError,
  BuffAuthError,
  BuffSwapError,
  BuffInsufficientBalanceError,
} from "@buff/sdk"

try {
  const { ready, transactions } = await buff.buildSwap(buffWalletPubkey)
  if (ready) {
    for (const tx of transactions) {
      const signed = await signTransaction(tx)
      await buff.executeSwap(signed)
    }
  }
} catch (err) {
  if (err instanceof BuffAuthError) {
    // Invalid or expired auth — re-authenticate
    console.error("Auth error:", err.reason)
  }

  if (err instanceof BuffApiError) {
    // API returned an error
    console.error("API error:", err.endpoint, err.statusCode)
  }

  if (err instanceof BuffSwapError) {
    // Swap failed at a specific phase
    console.error("Swap failed at:", err.phase)
    // phase: "quote" | "build" | "execute" | "confirm"
  }

  if (err instanceof BuffInsufficientBalanceError) {
    // Not enough SOL
    console.error("Need:", err.required, "Have:", err.available)
  }
}`} />

      <DocH2>API Error Responses</DocH2>
      <DocP>The Buff API returns structured error responses. The SDK parses these into typed error objects automatically.</DocP>
      <CodeBlock filename="api-error.ts" code={`// API error response format:
// {
//   error: "INSUFFICIENT_BALANCE",
//   message: "Not enough SOL for swap",
//   details: { required: 0.05, available: 0.01 }
// }
//
// The SDK wraps this into a BuffInsufficientBalanceError
// with .required and .available properties`} />

      <DocH2>Retry Strategies</DocH2>
      <DocP>Since all swap logic is server-side, transient failures can be retried by calling the same method again.</DocP>
      <CodeBlock filename="retry.ts" code={`// Simple retry pattern for swap execution
async function executeWithRetry(buff, signedTx, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await buff.executeSwap(signedTx)
    } catch (err) {
      if (err instanceof BuffSwapError && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)))
        continue
      }
      throw err
    }
  }
}`} />

      <DocNote>The Buff API handles retry logic for swap routing internally. Client-side retries are only needed for network-level failures (timeouts, connection drops).</DocNote>
    </DocContent>
  );
}
