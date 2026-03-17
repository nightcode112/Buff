"use client";

import { useState } from "react";
import { DocContent, DocH2, DocP, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function VanillaGuidePage() {
  const [tab, setTab] = useState<"phantom" | "reown" | "rest">("phantom");

  return (
    <DocContent title="Vanilla JS" description="No framework needed. Phantom direct, Reown modal, or pure REST API." badge="Guide">
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 border border-border/30 mb-8 w-fit">
        {([["phantom","Phantom"],["reown","Reown"],["rest","REST API"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? "bg-gold/10 text-gold border border-gold/20" : "text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "phantom" && (
        <>
          <DocH2>Phantom / Solflare Direct</DocH2>
          <InstallCommand command="npm install @buff/sdk @solana/web3.js" />
          <CodeBlock filename="app.ts" lang="typescript" code={`import { Buff } from '@buff/sdk'

const provider = (window as any).solana
await provider.connect()

const buff = await Buff.init({
  platformId: 'your-platform-id',
  signMessage: (msg) => provider.signMessage(msg, 'utf8'),
  plan: 'sprout',
})

const { transaction, breakdown } = await buff.wrap(
  tx, provider.publicKey, { txValueUsd: 15.42 }
)

const signed = await provider.signTransaction(transaction)
// send signed transaction...`} />
        </>
      )}

      {tab === "reown" && (
        <>
          <DocH2>Reown Modal</DocH2>
          <InstallCommand command="npm install @buff/sdk @reown/appkit @reown/appkit-adapter-solana" />
          <CodeBlock filename="app.ts" lang="typescript" code={`import { createAppKit } from '@reown/appkit'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { solana } from '@reown/appkit/networks'
import { Buff } from '@buff/sdk'

const appKit = createAppKit({
  projectId: 'YOUR_PROJECT_ID',
  adapters: [new SolanaAdapter()],
  networks: [solana],
})

// After wallet connects
const provider = appKit.getWalletProvider()
const buff = await Buff.init({
  platformId: 'your-platform-id',
  signMessage: async (msg) => new Uint8Array(await provider.signMessage(msg)),
})

const { transaction } = await buff.wrap(tx, pubkey, { txValueUsd: 27.63 })
await provider.sendTransaction(transaction)`} />
        </>
      )}

      {tab === "rest" && (
        <>
          <DocH2>REST API Only</DocH2>
          <DocP>No npm install. Works from any environment.</DocP>
          <CodeBlock filename="app.js" lang="typescript" code={`const API = 'https://your-buff.vercel.app'
const KEY = 'your-api-key'

// Calculate round-up
const res = await fetch(API + '/api/roundup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': KEY },
  body: JSON.stringify({ txValueUsd: 27.63, plan: 'tree' }),
})
const { data } = await res.json()
// data.roundUpUsd = 0.37
// data.userInvestmentSol = amount to transfer to Buff wallet

// Check threshold
const acc = await fetch(API + '/api/accumulator/' + buffWallet + '?threshold=5', {
  headers: { 'x-api-key': KEY }
}).then(r => r.json())

console.log('Threshold reached:', acc.data.thresholdReached)`} />
        </>
      )}

      <DocNote>All approaches produce identical results. Choose based on your environment.</DocNote>
    </DocContent>
  );
}
