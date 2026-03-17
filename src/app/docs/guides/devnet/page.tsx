import { DocContent, DocH2, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function DevnetGuidePage() {
  return (
    <DocContent title="Devnet Testing" description="Test the full Buff flow on Solana devnet before going to mainnet." badge="Guide">
      <DocH2>Switch to Devnet</DocH2>
      <CodeBlock filename="devnet.ts" code={`const buff = new Buff({
  apiKey: "your-api-key",
  network: "devnet",  // ← only change needed
  plan: "sprout",
  investInto: "USDC",  // only SOL + USDC on devnet
})`} />

      <DocH2>Available Tokens on Devnet</DocH2>
      <DocTable
        headers={["Asset", "Available", "Mint"]}
        rows={[
          ["SOL", "Yes", "So1111...1112 (native)"],
          ["USDC", "Yes", "4zMMC9...cqmJh (devnet faucet)"],
          ["BTC", "No*", "Maps to SOL on devnet"],
          ["ETH", "No*", "Maps to SOL on devnet"],
          ["USDT", "No*", "Maps to devnet USDC"],
        ]}
      />

      <DocNote>wBTC and wETH don&apos;t exist on devnet. The SDK maps them to SOL/USDC for testing. Use investInto: &quot;USDC&quot; or &quot;SOL&quot; for realistic devnet tests.</DocNote>

      <DocH2>Get Devnet SOL</DocH2>
      <DocP>Visit https://faucet.solana.com and paste your wallet address to get free devnet SOL.</DocP>

      <DocH2>Full Test Script</DocH2>
      <CodeBlock filename="test-devnet.ts" code={`import { Buff } from "@buff/sdk"
import { Connection, Keypair, Transaction, SystemProgram } from "@solana/web3.js"

const conn = new Connection("https://api.devnet.solana.com")
const user = Keypair.generate()

// Fund via airdrop (or use faucet.solana.com)
await conn.requestAirdrop(user.publicKey, 2e9)

// Init Buff with API key
const buff = new Buff({
  apiKey: "your-api-key",
  network: "devnet",
  plan: "tree",
  investInto: "USDC",
  investThreshold: 1, // low threshold for testing
})

// Derive a wallet for the agent
const wallet = await buff.deriveWallet(someSignature)
console.log("Buff wallet:", wallet.pubkey)

// Calculate a round-up for a $5.37 transaction
const breakdown = await buff.calculateRoundUp(5.37)
console.log("Round-up: $" + breakdown.roundUpUsd)

// Get wrap instructions
const { instructions } = await buff.getWrapInstructions(
  5.37, user.publicKey.toBase58(), wallet.pubkey
)

// Build transaction with round-up instructions
const tx = new Transaction()
tx.add(
  SystemProgram.transfer({
    fromPubkey: user.publicKey,
    toPubkey: Keypair.generate().publicKey,
    lamports: 1000000,
  })
)
for (const ix of instructions) tx.add(ix)

// Sign and send...

// Check portfolio (requires address parameter)
const portfolio = await buff.getPortfolio(wallet.pubkey)
console.log("Portfolio:", portfolio)

// Check accumulator state
const accumulator = await buff.getAccumulator(wallet.pubkey)
console.log("Threshold reached:", accumulator.thresholdReached)`} />
    </DocContent>
  );
}
