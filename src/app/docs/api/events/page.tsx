import { DocContent, DocH2, DocP, DocTable } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function EventsPage() {
  return (
    <DocContent title="Events" description="Subscribe to SDK events for real-time feedback on round-ups, swaps, and errors." badge="API">
      <DocH2>Available Events</DocH2>
      <DocTable
        headers={["Event", "Fires when", "Data"]}
        rows={[
          ["roundUp", "A transaction is wrapped with a round-up", "{ breakdown, roundUpCount }"],
          ["skipped", "Transaction was an exact match — no charge", "{ txValueUsd, reason }"],
          ["thresholdReached", "Accumulated balance hits the threshold", "{ state }"],
          ["swapExecuted", "Jupiter swap completed successfully", "{ result, quote }"],
          ["swapFailed", "Jupiter swap failed", "{ error, inputLamports, asset }"],
          ["priceUpdated", "SOL price was fetched/refreshed", "{ solPriceUsd }"],
        ]}
      />

      <DocH2>Usage</DocH2>
      <CodeBlock filename="events.ts" code={`// Subscribe
buff.events.on("roundUp", ({ breakdown, roundUpCount }) => {
  showNotification(
    "Invested $" + breakdown.userInvestmentUsd.toFixed(2) +
    " (round-up #" + roundUpCount + ")"
  )
})

buff.events.on("thresholdReached", ({ state }) => {
  showNotification(
    "Threshold reached! $" + state.balanceUsd.toFixed(2) +
    " ready to invest"
  )
})

buff.events.on("swapExecuted", ({ result, quote }) => {
  showNotification(
    "Bought " + result.asset + " with " +
    result.inputSol.toFixed(4) + " SOL"
  )
})

buff.events.on("swapFailed", ({ error, asset }) => {
  showError("Failed to buy " + asset + ": " + error.message)
})

buff.events.on("skipped", ({ txValueUsd }) => {
  // Exact dollar amount — no round-up needed
})

buff.events.on("priceUpdated", ({ solPriceUsd }) => {
  updatePriceDisplay(solPriceUsd)
})

// Unsubscribe
const handler = (data) => console.log(data)
buff.events.on("roundUp", handler)
buff.events.off("roundUp", handler)`} />

      <DocH2>React Example</DocH2>
      <CodeBlock filename="useBuffEvents.tsx" code={`function useBuffEvents(buff: Buff | null) {
  const [lastRoundUp, setLastRoundUp] = useState(null)
  const [swapCount, setSwapCount] = useState(0)

  useEffect(() => {
    if (!buff) return

    const onRoundUp = (data) => setLastRoundUp(data.breakdown)
    const onSwap = () => setSwapCount(c => c + 1)

    buff.events.on("roundUp", onRoundUp)
    buff.events.on("swapExecuted", onSwap)

    return () => {
      buff.events.off("roundUp", onRoundUp)
      buff.events.off("swapExecuted", onSwap)
    }
  }, [buff])

  return { lastRoundUp, swapCount }
}`} />
    </DocContent>
  );
}
