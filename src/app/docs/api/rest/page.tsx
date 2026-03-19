import { DocContent, DocH2, DocH3, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";
import { ApiPlayground } from "@/components/docs/api-playground";

export default function RestApiPage() {
  return (
    <DocContent title="REST API" description="HTTP endpoints for any language. No SDK needed — just HTTP calls. Try them live below." badge="API">
      <DocNote>Base URL: https://buff.finance. All endpoints return JSON with {`{ ok: boolean, data: ... }`} or {`{ ok: false, error: "..." }`}.</DocNote>

      <DocH2>Authentication</DocH2>
      <DocP>Public endpoints (GET /api/plans, GET /api/price, GET /api/auth) require no auth. All other endpoints require one of two methods:</DocP>

      <DocH3>Method 1: Wallet Signature (recommended)</DocH3>
      <DocP>Sign a message with any Solana wallet. No registration, no API keys, no database. Your wallet IS your identity.</DocP>
      <CodeBlock filename="auth.ts" code={`// 1. Get the message to sign
const res = await fetch("https://buff.finance/api/auth")
const { data } = await res.json()
// data.message = "Buff API Authentication"

// 2. Sign it with your wallet
const message = new TextEncoder().encode(data.message)
const signature = await wallet.signMessage(message)
const sigBase64 = btoa(String.fromCharCode(...signature))

// 3. Use on any protected endpoint
fetch("https://buff.finance/api/roundup", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-wallet": wallet.publicKey.toBase58(),
    "x-signature": sigBase64,
  },
  body: JSON.stringify({ txValueUsd: 27.63, plan: "tree" }),
})`} />

      <DocH3>Method 2: Static API Key</DocH3>
      <DocP>For server-to-server integrations where wallet signing is not practical.</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`curl -X POST https://buff.finance/api/roundup \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key" \\
  -d '{"txValueUsd": 27.63, "plan": "tree"}'`} />

      <DocH2>Rate Limiting</DocH2>
      <DocP>All API endpoints are rate-limited to 60 requests per minute per IP.</DocP>

      {/* ── Public Endpoints ── */}

      <DocH2>GET /api/auth</DocH2>
      <DocP>Get the authentication message to sign.</DocP>
      <ApiPlayground method="GET" endpoint="/api/auth" />

      <DocH2>GET /api/plans</DocH2>
      <DocP>List all available plan tiers and defaults.</DocP>
      <ApiPlayground method="GET" endpoint="/api/plans" />

      <DocH2>GET /api/price</DocH2>
      <DocP>Get real-time token prices (cached 30s).</DocP>
      <ApiPlayground method="GET" endpoint="/api/price" />

      <DocH2>GET /api/portfolio/:address</DocH2>
      <DocP>Read all token balances and USD values for any Solana wallet.</DocP>
      <ApiPlayground
        method="GET"
        endpoint="/api/portfolio/:address"
        pathParam="address"
        queryParams={[
          { name: "network", type: "select", options: ["mainnet-beta", "devnet"], defaultValue: "mainnet-beta" },
        ]}
      />

      <DocH2>GET /api/accumulator/:address</DocH2>
      <DocP>Check if a wallet has reached the investment threshold.</DocP>
      <ApiPlayground
        method="GET"
        endpoint="/api/accumulator/:address"
        pathParam="address"
        queryParams={[
          { name: "threshold", type: "number", placeholder: "5", defaultValue: "5" },
          { name: "network", type: "select", options: ["mainnet-beta", "devnet"], defaultValue: "mainnet-beta" },
        ]}
      />

      {/* ── Authenticated Endpoints ── */}

      <DocH2>POST /api/roundup</DocH2>
      <DocP>Calculate the round-up for a transaction value.</DocP>
      <DocTable
        headers={["Field", "Type", "Required", "Description"]}
        rows={[
          ["txValueUsd", "number", "Yes", "Total transaction value in USD"],
          ["plan", "string", "No", "Plan tier: seed, sprout, tree, forest"],
          ["roundToUsd", "number", "No", "Custom round-up increment (overrides plan)"],
          ["ceiling", "number", "No", "Max round-up (default: 1.00)"],
        ]}
      />
      <ApiPlayground
        method="POST"
        endpoint="/api/roundup"
        authRequired
        fields={[
          { name: "txValueUsd", type: "number", placeholder: "27.63", required: true, defaultValue: "27.63" },
          { name: "plan", type: "select", options: ["sprout", "seed", "tree", "forest"], defaultValue: "sprout" },
        ]}
      />

      <DocH2>POST /api/wrap</DocH2>
      <DocP>Get server-built transfer instructions with fees enforced. The treasury address is never exposed.</DocP>
      <DocTable
        headers={["Field", "Type", "Required", "Description"]}
        rows={[
          ["txValueUsd", "number", "Yes", "Total transaction value in USD"],
          ["userPubkey", "string", "Yes", "User's main wallet public key"],
          ["buffWalletPubkey", "string", "Yes", "User's Buff wallet public key"],
          ["plan", "string", "No", "Plan tier (default: sprout)"],
        ]}
      />
      <ApiPlayground
        method="POST"
        endpoint="/api/wrap"
        authRequired
        fields={[
          { name: "txValueUsd", type: "number", placeholder: "27.63", required: true, defaultValue: "27.63" },
          { name: "userPubkey", type: "string", placeholder: "Solana pubkey", required: true },
          { name: "buffWalletPubkey", type: "string", placeholder: "Buff wallet pubkey", required: true },
          { name: "plan", type: "select", options: ["sprout", "seed", "tree", "forest"], defaultValue: "sprout" },
        ]}
      />

      <DocH2>POST /api/swap/quote</DocH2>
      <DocP>Get a Jupiter swap quote (SOL → target asset).</DocP>
      <DocTable
        headers={["Field", "Type", "Required", "Description"]}
        rows={[
          ["inputLamports", "number", "Yes", "Amount of SOL in lamports (1 SOL = 1e9)"],
          ["targetAsset", "string", "No", "BTC, ETH, SOL, USDC, USDT (default: BTC)"],
          ["slippageBps", "number", "No", "Slippage in basis points (default: 100 = 1%)"],
        ]}
      />
      <ApiPlayground
        method="POST"
        endpoint="/api/swap/quote"
        authRequired
        fields={[
          { name: "inputLamports", type: "number", placeholder: "100000000", required: true, defaultValue: "100000000" },
          { name: "targetAsset", type: "select", options: ["BTC", "ETH", "USDC", "USDT"], defaultValue: "BTC" },
          { name: "slippageBps", type: "number", placeholder: "100", defaultValue: "100" },
        ]}
      />

      <DocH2>POST /api/swap/build</DocH2>
      <DocP>Build unsigned Jupiter swap transactions. Server checks balance, validates threshold, and builds the swap.</DocP>
      <DocTable
        headers={["Field", "Type", "Required", "Description"]}
        rows={[
          ["buffWalletPubkey", "string", "Yes", "Buff wallet to swap from"],
          ["targetAsset", "string", "No", "BTC, ETH, USDC, USDT (default: BTC)"],
          ["threshold", "number", "No", "USD threshold (default: 5)"],
          ["slippageBps", "number", "No", "Slippage in bps (default: 100)"],
        ]}
      />
      <ApiPlayground
        method="POST"
        endpoint="/api/swap/build"
        authRequired
        fields={[
          { name: "buffWalletPubkey", type: "string", placeholder: "Buff wallet pubkey", required: true },
          { name: "targetAsset", type: "select", options: ["BTC", "ETH", "USDC", "USDT"], defaultValue: "BTC" },
          { name: "threshold", type: "number", placeholder: "5", defaultValue: "5" },
        ]}
      />

      <DocH2>POST /api/wallet/derive</DocH2>
      <DocP>Derive a Buff wallet public key from a signature. Returns only the public key — never the private key.</DocP>
      <ApiPlayground
        method="POST"
        endpoint="/api/wallet/derive"
        fields={[
          { name: "signature", type: "string", placeholder: "base64 or hex encoded signature", required: true },
        ]}
      />

      <DocH2>POST /api/swap/execute</DocH2>
      <DocP>Submit a pre-signed transaction to the Solana network. The transaction must already be signed.</DocP>
      <ApiPlayground
        method="POST"
        endpoint="/api/swap/execute"
        authRequired
        fields={[
          { name: "signedTransaction", type: "string", placeholder: "base64-encoded signed transaction", required: true },
          { name: "network", type: "select", options: ["mainnet-beta", "devnet"], defaultValue: "mainnet-beta" },
        ]}
      />
    </DocContent>
  );
}
