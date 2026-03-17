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
      description="Buff creates a deterministic wallet from the user's signature. Same wallet every time, no storage needed, fully exportable."
      badge="Core Concept"
    >
      <DocH2>How It Works</DocH2>
      <DocList
        items={[
          'User signs a fixed message: "Buff Portfolio Wallet v1"',
          "The signature (unique per wallet) is SHA-256 hashed to get a 32-byte seed",
          "The seed generates a Solana Keypair — this is the Buff wallet",
          "Same main wallet → same signature → same Buff wallet, every time",
          "No private keys are stored anywhere — the wallet is derived on-the-fly",
        ]}
      />

      <CodeBlock
        filename="derivation.ts"
        code={`import { sha256 } from "@noble/hashes/sha2.js"
import { Keypair } from "@solana/web3.js"

// 1. User signs a message
const message = "Buff Portfolio Wallet v1"
const signature = await wallet.signMessage(encode(message))

// 2. Hash the signature to get 32 bytes
const seed = sha256(signature)

// 3. Create keypair from seed
const buffWallet = Keypair.fromSeed(seed)
// Same signature = same wallet, always`}
      />

      <DocH2>Exporting the Wallet</DocH2>
      <DocP>
        Users can export their Buff wallet&apos;s private key at any time and import
        it into Phantom, Solflare, or any Solana wallet. They have full
        control.
      </DocP>

      <CodeBlock
        filename="export.ts"
        code={`// Export the secret key
const secretKey = buff.exportKey()
// Uint8Array(64) — import this into Phantom

// The wallet address
const address = buff.getWalletAddress()
// e.g. "E71R6Ph2sS4eYJVSNLacorUtSDNK1rUixVswgFD5hCY3"`}
      />

      <DocNote>
        Buff never stores the private key. It&apos;s derived fresh each time from
        the user&apos;s signature. If the user signs with the same main wallet on a
        different device, they get the same Buff wallet.
      </DocNote>

      <DocH2>Security</DocH2>
      <DocList
        items={[
          "Private key only exists in memory during the session",
          "Uses @noble/hashes — audited, pure JS, no native dependencies",
          "The derivation message is versioned to prevent collisions",
          "Buff platform never has access to user funds",
        ]}
      />
    </DocContent>
  );
}
