import { DocContent, DocH2, DocP, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function StorageGuidePage() {
  return (
    <DocContent title="Custom Storage" description="Persist round-up counts and stats across sessions with custom storage adapters." badge="Guide">
      <DocH2>Default Behavior</DocH2>
      <DocP>Buff auto-detects the environment: localStorage in browsers, in-memory in Node.js. Override this by passing a custom storage adapter.</DocP>

      <DocH2>The Interface</DocH2>
      <CodeBlock filename="interface.ts" code={`interface BuffStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
}`} />

      <DocH2>Built-in Adapters</DocH2>
      <CodeBlock filename="adapters.ts" code={`import {
  LocalStorageAdapter,  // Browser localStorage
  MemoryStorage,        // In-memory (Node.js, tests)
  createDefaultStorage, // Auto-detect
} from "@buff/sdk"

// Auto-detect (default)
const buff = await Buff.init({ ... })

// Force localStorage
const buff = await Buff.init({
  storage: new LocalStorageAdapter("myapp_buff_"),
  ...
})

// Force memory (for tests)
const buff = await Buff.init({
  storage: new MemoryStorage(),
  ...
})`} />

      <DocH2>Custom: Redis Adapter</DocH2>
      <CodeBlock filename="redis-storage.ts" code={`import type { BuffStorage } from "@buff/sdk"
import { createClient } from "redis"

class RedisStorage implements BuffStorage {
  private client: ReturnType<typeof createClient>
  private prefix: string

  constructor(redisUrl: string, prefix = "buff:") {
    this.client = createClient({ url: redisUrl })
    this.prefix = prefix
    this.client.connect()
  }

  async get(key: string) {
    return this.client.get(this.prefix + key)
  }

  async set(key: string, value: string) {
    await this.client.set(this.prefix + key, value)
  }

  async delete(key: string) {
    await this.client.del(this.prefix + key)
  }
}

// Use it
const buff = await Buff.init({
  storage: new RedisStorage("redis://localhost:6379"),
  ...
})`} />

      <DocH2>What Gets Persisted</DocH2>
      <CodeBlock filename="state.ts" code={`interface PersistedState {
  roundUpCount: number        // Since last swap
  totalInvestedUsd: number    // Lifetime
  totalRoundUps: number       // Lifetime
  totalBuffFeesUsd: number     // Lifetime
  lastSwapTimestamp: number | null
}

// Access via
const stats = buff.getStats()
console.log(stats.totalRoundUps) // 142`} />

      <DocNote>State is keyed by the Buff wallet public key. Each user has their own isolated state, even on shared storage.</DocNote>
    </DocContent>
  );
}
