import { DocContent, DocH2, DocH3, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function InitPage() {
  return (
    <DocContent title="new Buff()" description="Create a Buff client instance — configure auth, plan, and investment preferences." badge="API">
      <DocH2>Signature</DocH2>
      <CodeBlock filename="types.ts" code={`new Buff(options: BuffOptions): Buff`} />

      <DocH2>Parameters</DocH2>
      <DocTable
        headers={["Option", "Type", "Default", "Description"]}
        rows={[
          ["apiKey", "string", "—", "API key for authentication (alternative to wallet auth)"],
          ["network", "'mainnet-beta' | 'devnet'", "'mainnet-beta'", "Solana network"],
          ["plan", "'seed' | 'sprout' | 'tree' | 'forest'", "'sprout'", "Round-up plan tier"],
          ["investInto", "SupportedAsset", "'BTC'", "Single target asset (use allocations for multi-asset)"],
          ["allocations", "Allocation[]", "[{asset:'BTC',pct:100}]", "Portfolio split — e.g. [{asset:'BTC',pct:60},{asset:'ETH',pct:40}]"],
          ["investThreshold", "number", "5", "USD threshold before swapping"],
          ["slippageBps", "number", "100", "Slippage tolerance (100 = 1%)"],
        ]}
      />

      <DocH2>Authentication</DocH2>
      <DocP>Buff supports two auth methods: API key (for agents/backends) or wallet signature (for browser-based apps).</DocP>
      <CodeBlock filename="auth.ts" code={`// Option 1: API key auth (set in constructor or later)
const buff = new Buff({ apiKey: "your-api-key" })

// Option 2: Wallet signature auth
const buff = new Buff({ plan: "sprout" })
const authMsg = await buff.getAuthMessage()
const signature = await wallet.signMessage(authMsg)
buff.setWalletAuth(wallet.publicKey.toBase58(), signature)

// Switch API key at runtime
buff.setApiKey("new-api-key")`} />

      <DocH2>Returns</DocH2>
      <DocP>A Buff instance. Unlike the old Buff.init(), the constructor is synchronous — no wallet signing required at creation time.</DocP>

      <DocH2>Example</DocH2>
      <CodeBlock filename="init.ts" code={`import { Buff } from "@buff/sdk"

// Single asset — 100% BTC
const buff = new Buff({
  apiKey: "my-api-key",
  investInto: "BTC",
})

// Multi-asset portfolio split
const buff = new Buff({
  apiKey: "my-api-key",
  plan: "tree",
  allocations: [
    { asset: "BTC", pct: 60 },
    { asset: "ETH", pct: 40 },
  ],
  investThreshold: 5,
})

// Change configuration at runtime
buff.setPlan("forest")
buff.setInvestAsset("ETH")
buff.setAllocations([
  { asset: "BTC", pct: 50 },
  { asset: "ETH", pct: 30 },
  { asset: "SOL", pct: 20 },
])
buff.setThreshold(10)`} />

      <DocNote>The constructor is synchronous. Wallet derivation is a separate async step via buff.deriveWallet(signature). No signMessage callback is needed — auth is handled via API key or wallet signature headers.</DocNote>
    </DocContent>
  );
}
