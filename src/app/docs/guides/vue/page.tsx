"use client";

import { useState } from "react";
import { DocContent, DocH2, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function VueGuidePage() {
  const [tab, setTab] = useState<"adapter" | "reown">("adapter");

  return (
    <DocContent title="Vue / Nuxt" description="Integrate Buff with Solana wallet adapter or Reown." badge="Guide">
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
          <InstallCommand command="npm install @buff/sdk solana-wallets-vue" />
          <DocH2>Composable</DocH2>
          <CodeBlock filename="useBuff.ts" lang="typescript" code={`import { ref, watch } from 'vue'
import { useWallet } from 'solana-wallets-vue'
import { Buff } from '@buff/sdk'

export function useBuff(apiKey: string) {
  const buff = ref<Buff | null>(null)
  const { signMessage, publicKey } = useWallet()

  watch([signMessage, publicKey], async ([sign, pk]) => {
    if (!sign || !pk) { buff.value = null; return }

    const b = new Buff({
      apiKey,
      plan: 'sprout',
      investInto: 'BTC',
    })

    // Authenticate with wallet signature
    const msg = new TextEncoder().encode('Sign in to Buff')
    const sig = await sign(msg)
    b.setWalletAuth(pk.toBase58(), Buffer.from(sig).toString('base64'))
    buff.value = b
  }, { immediate: true })

  return { buff }
}`} />
        </>
      ) : (
        <>
          <DocH2>Install</DocH2>
          <InstallCommand command="npm install @buff/sdk @reown/appkit @reown/appkit-adapter-solana" />
          <DocH2>Composable with Reown</DocH2>
          <CodeBlock filename="useBuff.ts" lang="typescript" code={`import { ref, watch } from 'vue'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/vue'
import { Buff } from '@buff/sdk'

export function useBuff(apiKey: string) {
  const buff = ref<Buff | null>(null)
  const { isConnected, address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('solana')

  watch([isConnected, walletProvider, address], async ([connected, provider, addr]) => {
    if (!connected || !provider || !addr) { buff.value = null; return }

    const b = new Buff({
      apiKey,
      plan: 'sprout',
      investInto: 'BTC',
    })

    const msg = new TextEncoder().encode('Sign in to Buff')
    const sig = await provider.signMessage(msg)
    b.setWalletAuth(addr, Buffer.from(new Uint8Array(sig)).toString('base64'))
    buff.value = b
  }, { immediate: true })

  return { buff }
}`} />
        </>
      )}

      <DocNote>Both approaches use the same Buff SDK. Authentication is via API key or wallet signature headers — no signMessage callback needed.</DocNote>
    </DocContent>
  );
}
