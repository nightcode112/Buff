import {
  DocContent,
  DocH2,
  DocP,
  DocList,
  DocNote,
} from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function WalletPage() {
  return (
    <DocContent
      title="Wallet Derivation"
      description="Buff derives a deterministic wallet from the user's signature via the server API. Same wallet every time, no client-side key management."
      badge="Core Concept"
    >
      <DocH2>How It Works</DocH2>
      <DocList
        items={[
          "User signs an auth message provided by buff.getAuthMessage()",
          "The signature is sent to the Buff API via buff.deriveWallet(signature)",
          "The server deterministically derives a Solana wallet from the signature",
          "Same main wallet + same signature = same Buff wallet, every time",
          "No private keys are handled client-side — derivation is fully server-side",
        ]}
      />

      <CodeBlock
        filename="derivation.ts"
        code={`import { Buff } from "buff-protocol-sdk"

const buff = new Buff({ apiKey: "your-api-key" })

// 1. Get the auth message from the server
const authMsg = await buff.getAuthMessage()

// 2. User signs the message with their wallet
const signature = await wallet.signMessage(authMsg)

// 3. Derive the Buff wallet via the API (server-side)
const buffWalletAddress = await buff.deriveWallet(signature)
// Same signature = same wallet, always

// 4. Optionally set wallet auth for subsequent requests
buff.setWalletAuth(wallet.publicKey.toBase58(), signature)`}
      />

      <DocH2>Agent Authentication</DocH2>
      <DocP>
        For backend agents and automated systems, use API key authentication
        instead of wallet signatures. Register your agent with the Buff API.
      </DocP>

      <CodeBlock
        filename="agent.ts"
        code={`// Agents use API key auth — no wallet signing needed
const buff = new Buff({ apiKey: "agent-api-key" })

// Register an agent with the API
await buff.registerAgent(agentPubkey, "my-agent-id")

// All subsequent calls are authenticated via the API key
const portfolio = await buff.getPortfolio(buffWalletAddress)`}
      />

      <DocNote>
        Wallet derivation happens entirely server-side. The client never
        handles private keys — it only sends the user&apos;s signature to the
        API. The server derives the same deterministic wallet every time.
      </DocNote>

      <DocH2>Security</DocH2>
      <DocList
        items={[
          "No private keys handled client-side — all derivation is server-side",
          "Auth via API key or wallet signature headers",
          "The derivation message is versioned to prevent collisions",
          "Treasury address never exposed to the client",
          "All fee calculations happen server-side",
        ]}
      />
    </DocContent>
  );
}
