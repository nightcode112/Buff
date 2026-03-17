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
        automated systems need a different approach. Buff v1.0.0 uses API key
        authentication — no browser wallet or signMessage callback needed.
      </DocP>

      <DocH2>Method 1: API Key Authentication</DocH2>
      <DocP>
        The simplest approach for agents. Create a Buff instance with your API
        key and configure your plan.
      </DocP>
      <CodeBlock
        filename="agent-apikey.ts"
        code={`import { Buff } from "buff-protocol-sdk"

const buff = new Buff({
  apiKey: "your-api-key",
  plan: "sprout",
  investInto: "BTC",
})

// Derive a deterministic wallet from a signature
const wallet = await buff.deriveWallet(agentSignature)
console.log("Agent wallet:", wallet.pubkey)`}
      />

      <DocH2>Method 2: Register an Agent</DocH2>
      <DocP>
        Register your agent with a public key and agent ID. This helps track
        round-ups by agent in your analytics.
      </DocP>
      <CodeBlock
        filename="agent-register.ts"
        code={`import { Buff } from "buff-protocol-sdk"

const buff = new Buff({
  apiKey: "your-api-key",
  plan: "sprout",
  investInto: "BTC",
})

// Register agent for tracking and analytics
await buff.registerAgent(agentPubkey, "claude-trading-bot")`}
      />

      <DocH2>Method 3: For Claude / GPT Agents</DocH2>
      <DocP>
        When running inside an AI agent framework, use the API key and
        register with an agent identifier for analytics.
      </DocP>
      <CodeBlock
        filename="agent-ai.ts"
        code={`import { Buff } from "buff-protocol-sdk"

const buff = new Buff({
  apiKey: process.env.BUFF_API_KEY,
  plan: "sprout",
  investInto: "BTC",
  investThreshold: 5,
})

// Register the agent
await buff.registerAgent(agentPubkey, "claude-trading-bot")

// Calculate round-up for any spend
const breakdown = await buff.calculateRoundUp(0.50)
console.log("Round-up:", breakdown.roundUpUsd)`}
      />

      <DocH2>Funding the Agent Wallet</DocH2>
      <DocP>
        The agent wallet needs SOL to pay for round-ups and transaction fees.
        Derive a wallet using{" "}
        <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">buff.deriveWallet()</code>{" "}
        and transfer SOL to the returned address.
        On devnet, you can use the Solana faucet. On mainnet, transfer from an
        existing wallet or fund via an exchange.
      </DocP>
      <DocList
        items={[
          "Minimum balance: ~0.01 SOL covers several hundred round-ups",
          "The agent wallet is a standard Solana keypair — fund it like any other wallet",
          "Use buff.deriveWallet(signature) to get a deterministic deposit address",
        ]}
      />

      <DocH2>Calculate Round-Ups for Non-Transaction Spends</DocH2>
      <DocP>
        Agents often pay for API calls, compute, or other services that
        aren&apos;t Solana transactions. Use{" "}
        <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">calculateRoundUp()</code>{" "}
        to compute the round-up amount, then use{" "}
        <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">getWrapInstructions()</code>{" "}
        to get the transfer instructions.
      </DocP>
      <CodeBlock
        filename="agent-roundup.ts"
        code={`// Calculate round-up for an API call cost
const breakdown = await buff.calculateRoundUp(0.50)
console.log("Round-up:", breakdown.roundUpUsd)

// Get instructions to transfer the round-up amount
const { instructions } = await buff.getWrapInstructions(
  0.50, agentPubkey, buffWalletPubkey
)

// Build and execute swap when threshold is reached
const { ready, transactions } = await buff.buildSwap(buffWalletPubkey)
if (ready) {
  for (const tx of transactions) {
    const signed = signTransaction(tx) // sign with agent keypair
    await buff.executeSwap(Buffer.from(signed).toString("base64"))
  }
}`}
      />

      <DocNote>
        Agent wallets are fully non-custodial. All fee logic is handled
        server-side. The SDK is just an HTTP client to the buff.finance API.
      </DocNote>
    </DocContent>
  );
}
