import { DocContent, DocH2, DocP, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function StorageGuidePage() {
  return (
    <DocContent title="Custom Storage" description="Client-side caching strategies for the Buff API." badge="Guide">
      <DocH2>Default Behavior</DocH2>
      <DocP>In Buff v1.0.0, all state is managed server-side via the buff.finance API. The SDK is a thin HTTP client and does not persist local state. Portfolio data, accumulator state, and round-up history are all fetched from the API on demand.</DocP>

      <DocH2>Fetching State</DocH2>
      <CodeBlock filename="state.ts" code={`import { Buff } from "buff-protocol-sdk"

const buff = new Buff({ apiKey: "your-api-key" })

// Portfolio — requires wallet address
const portfolio = await buff.getPortfolio("wallet-address")
console.log("Holdings:", portfolio)

// Accumulator state — round-up totals and threshold status
const accumulator = await buff.getAccumulator("wallet-address")
console.log("Pending USD:", accumulator.pendingUsd)
console.log("Threshold reached:", accumulator.thresholdReached)

// Calculate a round-up (stateless, no persistence needed)
const breakdown = await buff.calculateRoundUp(5.37)
console.log("Round-up:", breakdown.roundUpUsd)`} />

      <DocH2>Client-Side Caching (Optional)</DocH2>
      <DocP>If you want to cache API responses locally to reduce network calls, you can implement your own caching layer around the SDK.</DocP>
      <CodeBlock filename="cache.ts" code={`import { Buff } from "buff-protocol-sdk"

const buff = new Buff({ apiKey: "your-api-key" })

// Simple in-memory cache example
const cache = new Map<string, { data: any; expiry: number }>()

async function getCachedPortfolio(address: string, ttlMs = 30000) {
  const key = "portfolio:" + address
  const cached = cache.get(key)
  if (cached && cached.expiry > Date.now()) return cached.data

  const portfolio = await buff.getPortfolio(address)
  cache.set(key, { data: portfolio, expiry: Date.now() + ttlMs })
  return portfolio
}`} />

      <DocH2>Server-Side Cache: Redis Example</DocH2>
      <CodeBlock filename="redis-cache.ts" code={`import { Buff } from "buff-protocol-sdk"
import { createClient } from "redis"

const buff = new Buff({ apiKey: "your-api-key" })
const redis = createClient({ url: "redis://localhost:6379" })
await redis.connect()

async function getCachedPortfolio(address: string, ttlSec = 30) {
  const key = "buff:portfolio:" + address
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  const portfolio = await buff.getPortfolio(address)
  await redis.set(key, JSON.stringify(portfolio), { EX: ttlSec })
  return portfolio
}

async function getCachedAccumulator(address: string, ttlSec = 10) {
  const key = "buff:accumulator:" + address
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  const accumulator = await buff.getAccumulator(address)
  await redis.set(key, JSON.stringify(accumulator), { EX: ttlSec })
  return accumulator
}`} />

      <DocNote>All state lives server-side in Buff v1.0.0. The SDK is stateless — caching is optional and only needed to reduce API calls in high-frequency scenarios.</DocNote>
    </DocContent>
  );
}
