"use client";

import { useState } from "react";
import { DocContent, DocH2, DocH3, DocP, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function ReactGuidePage() {
  const [tab, setTab] = useState<"adapter" | "reown">("adapter");

  return (
    <DocContent title="React / Next.js" description="Full integration guide with Solana Wallet Adapter and Reown (WalletConnect)." badge="Guide">

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 border border-border/30 mb-8 w-fit">
        <button
          onClick={() => setTab("adapter")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "adapter"
              ? "bg-gold/10 text-gold border border-gold/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Wallet Adapter
        </button>
        <button
          onClick={() => setTab("reown")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "reown"
              ? "bg-gold/10 text-gold border border-gold/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Reown (WalletConnect)
        </button>
      </div>

      {tab === "adapter" ? (
        <>
          <DocH2>Install</DocH2>
          <InstallCommand command="npm install @buff/sdk @solana/wallet-adapter-react @solana/wallet-adapter-wallets" />

          <DocH2>Provider</DocH2>
          <CodeBlock filename="BuffProvider.tsx" code={`"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Buff } from "@buff/sdk"

const BuffContext = createContext<Buff | null>(null)

export function BuffProvider({ children, platformId }: {
  children: React.ReactNode
  platformId: string
}) {
  const { signMessage, publicKey } = useWallet()
  const [buff, setBuff] = useState<Buff | null>(null)

  useEffect(() => {
    if (!signMessage || !publicKey) return

    Buff.init({
      platformId,
      signMessage: (msg) => signMessage(msg),
      plan: "sprout",
      investInto: "BTC",
    }).then(setBuff)
  }, [signMessage, publicKey, platformId])

  return (
    <BuffContext.Provider value={buff}>
      {children}
    </BuffContext.Provider>
  )
}

export const useBuff = () => useContext(BuffContext)`} />

          <DocH2>Wrapping Transactions</DocH2>
          <CodeBlock filename="useSwap.tsx" code={`import { useBuff } from "./BuffProvider"
import { useWallet } from "@solana/wallet-adapter-react"

function SwapButton({ tx, valueUsd }) {
  const buff = useBuff()
  const { publicKey, sendTransaction } = useWallet()

  const handleSwap = async () => {
    if (!buff || !publicKey) return

    const { transaction, breakdown } = await buff.wrap(
      tx, publicKey, { txValueUsd: valueUsd }
    )

    if (!breakdown.skipped) {
      toast("Investing $" + breakdown.roundUpUsd.toFixed(2))
    }

    await sendTransaction(transaction, connection)

    const { swap } = await buff.checkAndInvest()
    if (swap) toast("Bought " + swap.asset + "!")
  }

  return <button onClick={handleSwap}>Swap</button>
}`} />
        </>
      ) : (
        <>
          <DocH2>Install</DocH2>
          <InstallCommand command="npm install @buff/sdk @reown/appkit @reown/appkit-adapter-solana" />

          <DocH2>Reown Setup</DocH2>
          <CodeBlock filename="reown-config.tsx" code={`"use client"
import { createAppKit } from "@reown/appkit"
import { SolanaAdapter } from "@reown/appkit-adapter-solana"
import { solana } from "@reown/appkit/networks"

const solanaAdapter = new SolanaAdapter()

export const appKit = createAppKit({
  projectId: "YOUR_REOWN_PROJECT_ID",  // from cloud.reown.com
  adapters: [solanaAdapter],
  networks: [solana],
  metadata: {
    name: "Your App",
    description: "Your app with Buff integration",
    url: "https://yourapp.com",
    icons: ["https://yourapp.com/icon.png"],
  },
})`} />

          <DocH2>Provider with Reown</DocH2>
          <CodeBlock filename="BuffProvider.tsx" code={`"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import { Buff } from "@buff/sdk"

const BuffContext = createContext<Buff | null>(null)

export function BuffProvider({ children, platformId }: {
  children: React.ReactNode
  platformId: string
}) {
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider("solana")
  const [buff, setBuff] = useState<Buff | null>(null)

  useEffect(() => {
    if (!isConnected || !walletProvider) return

    Buff.init({
      platformId,
      signMessage: async (msg) => {
        // Reown's Solana provider exposes signMessage
        const result = await walletProvider.signMessage(msg)
        return new Uint8Array(result)
      },
      plan: "sprout",
      investInto: "BTC",
    }).then(setBuff)
  }, [isConnected, walletProvider, platformId])

  return (
    <BuffContext.Provider value={buff}>
      {children}
    </BuffContext.Provider>
  )
}

export const useBuff = () => useContext(BuffContext)`} />

          <DocH2>Wrapping Transactions</DocH2>
          <CodeBlock filename="useSwap.tsx" code={`import { useBuff } from "./BuffProvider"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import { PublicKey } from "@solana/web3.js"

function SwapButton({ tx, valueUsd }) {
  const buff = useBuff()
  const { address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider("solana")

  const handleSwap = async () => {
    if (!buff || !address || !walletProvider) return

    const pubkey = new PublicKey(address)
    const { transaction, breakdown } = await buff.wrap(
      tx, pubkey, { txValueUsd: valueUsd }
    )

    if (!breakdown.skipped) {
      toast("Investing $" + breakdown.roundUpUsd.toFixed(2))
    }

    // Send via Reown provider
    await walletProvider.sendTransaction(transaction)

    const { swap } = await buff.checkAndInvest()
    if (swap) toast("Bought " + swap.asset + "!")
  }

  return <button onClick={handleSwap}>Swap</button>
}`} />

          <DocH2>Connect Button</DocH2>
          <CodeBlock filename="ConnectButton.tsx" code={`// Reown provides a built-in connect button
import { useAppKit } from "@reown/appkit/react"

function ConnectButton() {
  const { open } = useAppKit()
  return <button onClick={() => open()}>Connect Wallet</button>
}

// Or use the pre-built component:
// <appkit-button />`} />
        </>
      )}

      <DocNote>
        Both approaches produce the same Buff wallet from the same main wallet.
        The SDK&apos;s signMessage option is framework-agnostic — it just needs a
        function that takes Uint8Array and returns a signed Uint8Array.
      </DocNote>
    </DocContent>
  );
}
