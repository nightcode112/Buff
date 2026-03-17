import {
  DocContent,
  DocH2,
  DocH3,
  DocP,
  DocNote,
} from "@/components/docs/doc-layout";
import { CodeBlock, PackageInstall } from "@/components/docs/code-block";

export default function InstallationPage() {
  return (
    <DocContent
      title="Installation"
      description="Get Buff SDK installed in your project in under a minute."
    >
      <DocH2>Install the package</DocH2>
      <PackageInstall pkg="buff-protocol-sdk" />

      <DocH2>Peer Dependencies</DocH2>
      <DocP>
        Buff SDK requires <code className="text-[13px] font-mono bg-muted px-1.5 py-0.5 rounded">@solana/web3.js</code> as a peer dependency. If you don&apos;t already have it:
      </DocP>
      <PackageInstall pkg="@solana/web3.js" />

      <DocH2>Requirements</DocH2>
      <DocH3>Browser</DocH3>
      <DocP>
        Works out of the box in any modern browser. Uses Web Crypto API
        internally via <code className="text-[13px] font-mono bg-muted px-1.5 py-0.5 rounded">@noble/hashes</code>. No polyfills needed.
      </DocP>

      <DocH3>Node.js</DocH3>
      <DocP>
        Requires Node.js 18+ for native fetch support. No additional
        configuration needed.
      </DocP>

      <DocNote>
        Buff uses <code className="text-[13px] font-mono bg-muted px-1.5 py-0.5 rounded">@noble/hashes</code> for SHA-256 hashing (wallet derivation) — a pure JavaScript implementation with no WASM or native modules.
      </DocNote>

      <DocH2>Verify Installation</DocH2>
      <CodeBlock
        filename="test.ts"
        code={`import { Buff } from "buff-protocol-sdk"

// Check it works
const buff = new Buff({ apiKey: "your-api-key" })
const plans = await buff.getPlans()
console.log(plans)
// { seed: { name: 'Seed', roundToUsd: 0.05, ... }, ... }

const result = await buff.calculateRoundUp(27.63)
console.log(result)
// { roundUpUsd: 0.07, skipped: false, capped: false }`}
      />
    </DocContent>
  );
}
