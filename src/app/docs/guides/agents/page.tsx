import {
  DocContent,
  DocH2,
  DocP,
  DocNote,
  DocList,
  DocTable,
} from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function AgentIntegrationPage() {
  return (
    <DocContent
      title="Agent Integration"
      description="Run Buff in headless mode for AI agents, bots, and server-side scripts — no browser wallet required."
      badge="Guide"
    >
      <DocH2>Why Headless Mode?</DocH2>
      <DocP>
        Browser wallets like Phantom work great for humans, but AI agents and
        automated systems need a different approach. Buff supports three
        initialization methods that skip the browser wallet entirely.
      </DocP>

      <DocH2>Method 1: Direct Keypair</DocH2>
      <DocP>
        Generate or load a Solana keypair and pass it directly. This is the
        simplest approach for agents that manage their own keys.
      </DocP>
      <CodeBlock
        filename="agent-keypair.ts"
        code={`import { Buff } from "@buff/sdk"
import { Keypair } from "@solana/web3.js"

// Method 1: Direct keypair
const keypair = Keypair.generate()
const buff = await Buff.init({
  agentKeypair: keypair,
  platformId: "my-agent",
  plan: "sprout",
  investInto: "BTC",
})`}
      />

      <DocH2>Method 2: From Seed (Deterministic)</DocH2>
      <DocP>
        Derive a keypair from a hex-encoded 32-byte seed. The same seed always
        produces the same wallet, making it easy to recover or share state
        across restarts.
      </DocP>
      <CodeBlock
        filename="agent-seed.ts"
        code={`import { Buff } from "@buff/sdk"

// Method 2: From seed (deterministic)
const buff = await Buff.init({
  agentSeed: "hex-encoded-32-byte-seed",
  platformId: "my-agent",
})`}
      />

      <DocH2>Method 3: For Claude / GPT Agents</DocH2>
      <DocP>
        When running inside an AI agent framework, pass the keypair along with
        an agent identifier and source tag. This helps track round-ups by agent
        in your analytics.
      </DocP>
      <CodeBlock
        filename="agent-ai.ts"
        code={`import { Buff } from "@buff/sdk"

// Method 3: For Claude/GPT agents
const buff = await Buff.init({
  agentKeypair: agentWallet,
  agentId: "claude-trading-bot",
  source: "agent",
})`}
      />

      <DocH2>Funding the Agent Wallet</DocH2>
      <DocP>
        The agent wallet needs SOL to pay for round-ups and transaction fees.
        Transfer SOL to the wallet address returned by{" "}
        <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">buff.getWalletAddress()</code>.
        On devnet, you can use the Solana faucet. On mainnet, transfer from an
        existing wallet or fund via an exchange.
      </DocP>
      <DocList
        items={[
          "Minimum balance: ~0.01 SOL covers several hundred round-ups",
          "The agent wallet is a standard Solana keypair — fund it like any other wallet",
          "Use buff.getWalletAddress() to get the deposit address",
        ]}
      />

      <DocH2>Using wrapAmount() for Non-Transaction Round-Ups</DocH2>
      <DocP>
        Agents often pay for API calls, compute, or other services that
        aren&apos;t Solana transactions. Use{" "}
        <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">wrapAmount()</code>{" "}
        to record a round-up without wrapping an on-chain transaction.
      </DocP>
      <CodeBlock
        filename="wrap-amount.ts"
        code={`// Record a round-up (agent pays for API, records the round-up)
const { breakdown } = await buff.wrapAmount({
  txValueUsd: 0.50, // cost of API call
  source: "agent",
})

console.log("Round-up:", breakdown.roundUpUsd)
// Accumulated in the Buff wallet, auto-invests at threshold`}
      />

      <DocNote>
        Agent wallets are fully non-custodial. The keypair never leaves your
        server. You can export and import the key at any time, just like a
        browser-based Buff wallet.
      </DocNote>
    </DocContent>
  );
}
