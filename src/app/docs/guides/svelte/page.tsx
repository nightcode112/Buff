"use client";

import { useState } from "react";
import { DocContent, DocH2, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function SvelteGuidePage() {
  const [tab, setTab] = useState<"adapter" | "reown">("adapter");

  return (
    <DocContent title="Svelte / SvelteKit" description="Integrate Buff with a wallet adapter or Reown." badge="Guide">
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 border border-border/30 mb-8 w-fit">
        {(["adapter", "reown"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-gold/10 text-gold border border-gold/20" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "adapter" ? "Wallet Adapter" : "Reown"}
          </button>
        ))}
      </div>

      {tab === "adapter" ? (
        <>
          <DocH2>Install</DocH2>
          <InstallCommand command="npm install @buff/sdk" />
          <DocH2>Store</DocH2>
          <CodeBlock filename="buffStore.ts" lang="typescript" code={`import { writable } from 'svelte/store'
import { Buff } from '@buff/sdk'

export const buffInstance = writable<Buff | null>(null)

export async function initBuff(signMessage: (msg: Uint8Array) => Promise<Uint8Array>) {
  const buff = await Buff.init({
    platformId: 'your-platform-id',
    signMessage,
    plan: 'sprout',
    investInto: 'BTC',
  })
  buffInstance.set(buff)
}`} />
        </>
      ) : (
        <>
          <DocH2>Install</DocH2>
          <InstallCommand command="npm install @buff/sdk @reown/appkit @reown/appkit-adapter-solana" />
          <DocH2>Reown Store</DocH2>
          <CodeBlock filename="buffStore.ts" lang="typescript" code={`import { writable } from 'svelte/store'
import { createAppKit } from '@reown/appkit'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { solana } from '@reown/appkit/networks'
import { Buff } from '@buff/sdk'

export const buffInstance = writable<Buff | null>(null)

export const appKit = createAppKit({
  projectId: 'YOUR_REOWN_PROJECT_ID',
  adapters: [new SolanaAdapter()],
  networks: [solana],
})

export async function initBuff() {
  const provider = appKit.getWalletProvider()
  if (!provider) return
  const buff = await Buff.init({
    platformId: 'your-platform-id',
    signMessage: async (msg) => new Uint8Array(await provider.signMessage(msg)),
    plan: 'sprout',
  })
  buffInstance.set(buff)
}`} />
        </>
      )}

      <DocNote>Call initBuff() in onMount for client-side only initialization.</DocNote>
    </DocContent>
  );
}
