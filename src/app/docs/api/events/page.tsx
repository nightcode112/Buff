import { DocContent, DocH2, DocP, DocNote, DocTable } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function EventsPage() {
  return (
    <DocContent title="Webhooks & Polling" description="Monitor round-ups, swaps, and portfolio changes in your application." badge="API">
      <DocH2>Polling Pattern</DocH2>
      <DocP>Since the SDK v1.0.0 is a stateless API client, use polling to monitor state changes:</DocP>

      <CodeBlock filename="monitor.ts" code={`import { Buff } from "buff-protocol-sdk"

const buff = new Buff({ apiKey: "YOUR_KEY" })
const walletAddress = "YOUR_BUFF_WALLET"

// Poll accumulator for threshold changes
async function checkThreshold() {
  const acc = await buff.getAccumulator(walletAddress)

  if (acc.thresholdReached) {
    console.log("Threshold reached! $" + acc.balanceUsd.toFixed(2))

    // Build and execute swap
    const result = await buff.buildSwap(walletAddress)
    if (result.ready) {
      for (const tx of result.transactions) {
        // Sign tx.transaction with your wallet, then:
        const executed = await buff.executeSwap(signedTx)
        console.log("Swapped to " + tx.asset + ": " + executed.txSignature)
      }
    }
  } else {
    console.log("$" + acc.balanceUsd.toFixed(2) + " / $" + acc.thresholdUsd)
  }
}

// Check every 60 seconds
setInterval(checkThreshold, 60_000)`} />

      <DocH2>React Hook Example</DocH2>
      <CodeBlock filename="useBuffMonitor.tsx" code={`function useBuffMonitor(buff: Buff | null, walletAddress: string) {
  const [accumulator, setAccumulator] = useState(null)
  const [portfolio, setPortfolio] = useState(null)

  useEffect(() => {
    if (!buff || !walletAddress) return

    const poll = async () => {
      const [acc, port] = await Promise.all([
        buff.getAccumulator(walletAddress),
        buff.getPortfolio(walletAddress),
      ])
      setAccumulator(acc)
      setPortfolio(port)
    }

    poll() // initial fetch
    const interval = setInterval(poll, 30_000)
    return () => clearInterval(interval)
  }, [buff, walletAddress])

  return { accumulator, portfolio }
}`} />

      <DocH2>Available Data</DocH2>
      <DocTable
        headers={["Endpoint", "What to monitor", "Suggested interval"]}
        rows={[
          ["getAccumulator(addr)", "Balance vs threshold — triggers swap", "30-60s"],
          ["getPortfolio(addr)", "Token balances after swaps", "60s"],
          ["getPrices()", "SOL/BTC/ETH price changes", "120s"],
          ["calculateRoundUp(usd)", "Preview before wrapping", "On demand"],
        ]}
      />

      <DocNote>The Buff API has rate limiting (60 requests/min per IP). Keep polling intervals at 30s+ to stay well within limits.</DocNote>
    </DocContent>
  );
}
