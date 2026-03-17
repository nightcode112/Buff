import { DocContent, DocH2, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function ErrorsPage() {
  return (
    <DocContent title="Error Handling" description="All SDK errors extend BuffError with structured context for debugging." badge="API">
      <DocH2>Error Types</DocH2>
      <DocTable
        headers={["Error", "When", "Properties"]}
        rows={[
          ["BuffPriceError", "Price API fails or returns bad data", "endpoint, statusCode"],
          ["BuffSwapError", "Jupiter quote/swap fails", "phase, statusCode, responseBody"],
          ["BuffInsufficientBalanceError", "Not enough SOL for swap", "required, available"],
          ["BuffNetworkError", "RPC connection fails", "rpcUrl"],
          ["BuffWalletDerivationError", "Invalid or empty signature", "—"],
        ]}
      />

      <DocH2>Catching Errors</DocH2>
      <CodeBlock filename="errors.ts" code={`import {
  BuffPriceError,
  BuffSwapError,
  BuffInsufficientBalanceError,
  BuffWalletDerivationError,
} from "@buff/sdk"

try {
  const { swap } = await buff.checkAndInvest()
} catch (err) {
  if (err instanceof BuffPriceError) {
    // Price API down — retry later
    console.error("Price API:", err.endpoint, err.statusCode)
  }

  if (err instanceof BuffSwapError) {
    // Swap failed at a specific phase
    console.error("Swap failed at:", err.phase)
    // phase: "quote" | "transaction" | "send" | "confirm"
  }

  if (err instanceof BuffInsufficientBalanceError) {
    // Not enough SOL
    console.error("Need:", err.required, "Have:", err.available)
  }
}`} />

      <DocH2>Swap Retry Logic</DocH2>
      <DocP>The SDK automatically retries swap sends up to 2 times on transient failures. It also simulates the transaction before sending to catch errors early.</DocP>
      <CodeBlock filename="retry.ts" code={`// Built-in retry flow:
// 1. Get Jupiter quote
// 2. Get swap transaction
// 3. Simulate transaction (catches most errors)
// 4. Send → if fails, wait 1s → retry
// 5. Send → if fails, wait 2s → retry
// 6. If still fails → throw BuffSwapError`} />

      <DocH2>Event-Based Error Handling</DocH2>
      <DocP>Instead of try/catch, you can listen for error events:</DocP>
      <CodeBlock filename="events.ts" code={`buff.events.on("swapFailed", ({ error, asset, inputLamports }) => {
  // Log to your error tracking
  Sentry.captureException(error, {
    extra: { asset, inputLamports }
  })

  // Show user-friendly message
  showToast("Investment delayed — will retry on next transaction")
})`} />

      <DocNote>checkAndInvest() catches swap errors internally and emits swapFailed instead of throwing. This ensures your transaction flow isn&apos;t interrupted by swap failures.</DocNote>
    </DocContent>
  );
}
