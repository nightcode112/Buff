import { DocContent, DocH2, DocH3, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function InitPage() {
  return (
    <DocContent title="Buff.init()" description="Initialize the SDK — derives the user's Buff wallet and connects to the network." badge="API">
      <DocH2>Signature</DocH2>
      <CodeBlock filename="types.ts" code={`static async init(options: BuffInitOptions): Promise<Buff>`} />

      <DocH2>Parameters</DocH2>
      <DocTable
        headers={["Option", "Type", "Default", "Description"]}
        rows={[
          ["platformId", "string", "required", "Your platform ID (provided by Buff)"],
          ["signMessage", "(msg: Uint8Array) => Promise<Uint8Array>", "required", "Wallet adapter sign function"],
          ["network", "'mainnet-beta' | 'devnet'", "'mainnet-beta'", "Solana network"],
          ["rpcUrl", "string", "auto", "Custom RPC endpoint (auto-selected by network)"],
          ["plan", "'seed' | 'sprout' | 'tree' | 'forest'", "'sprout'", "Round-up plan tier"],
          ["roundToUsd", "number", "—", "Custom round-up increment (overrides plan)"],
          ["roundUpCeiling", "number", "1.00", "Max round-up per tx in USD"],
          ["investInto", "SupportedAsset", "'BTC'", "Single target asset (use allocations for multi-asset)"],
          ["allocations", "Allocation[]", "[{asset:'BTC',pct:100}]", "Portfolio split — e.g. [{asset:'BTC',pct:60},{asset:'ETH',pct:40}]"],
          ["investThreshold", "number", "5", "USD threshold before swapping"],
          ["slippageBps", "number", "100", "Slippage tolerance (100 = 1%)"],
          ["storage", "BuffStorage", "auto", "Custom persistence adapter"],
          ["priceCacheTtlMs", "number", "30000", "Price cache duration in ms"],
        ]}
      />

      <DocH2>Returns</DocH2>
      <DocP>A Promise that resolves to a Buff instance. The user will be prompted to sign a message during initialization to derive their Buff wallet.</DocP>

      <DocH2>Example</DocH2>
      <CodeBlock filename="init.ts" code={`import { Buff } from "@buff/sdk"

// Single asset — 100% BTC
const buff = await Buff.init({
  platformId: "my-dex",
  signMessage: (msg) => wallet.signMessage(msg),
  investInto: "BTC",
})

// Multi-asset portfolio split
const buff = await Buff.init({
  platformId: "my-dex",
  signMessage: (msg) => wallet.signMessage(msg),
  plan: "tree",
  allocations: [
    { asset: "BTC", pct: 60 },
    { asset: "ETH", pct: 40 },
  ],
  investThreshold: 5,
})

// Change allocation at runtime
buff.setAllocations([
  { asset: "BTC", pct: 50 },
  { asset: "ETH", pct: 30 },
  { asset: "SOL", pct: 20 },
])
console.log(buff.getAllocations())
// [{asset:"BTC",pct:50},{asset:"ETH",pct:30},{asset:"SOL",pct:20}]`} />

      <DocNote>The user only signs once per session. The signature deterministically produces the same Buff wallet every time — no storage needed.</DocNote>
    </DocContent>
  );
}
