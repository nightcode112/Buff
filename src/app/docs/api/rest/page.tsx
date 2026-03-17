import { DocContent, DocH2, DocH3, DocP, DocTable, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

export default function RestApiPage() {
  return (
    <DocContent title="REST API" description="HTTP endpoints for any language. No SDK needed — just HTTP calls." badge="API">
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

      <DocH2>GET /api/auth</DocH2>
      <DocP>Get the authentication message to sign, and instructions.</DocP>
      <CodeBlock filename="response.json" lang="typescript" code={`{
  "ok": true,
  "data": {
    "message": "Buff API Authentication",
    "instructions": "Sign this message with your Solana wallet..."
  }
}`} />

      <DocH2>POST /api/auth</DocH2>
      <DocP>Verify your signature works before using protected endpoints.</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`curl -X POST https://buff.finance/api/auth \\
  -H "Content-Type: application/json" \\
  -d '{"wallet": "YourPubkey...", "signature": "Base64Sig..."}'`} />

      <DocH2>Rate Limiting</DocH2>
      <DocP>All API endpoints are rate-limited to 60 requests per minute per IP. Response headers include X-RateLimit-Limit and X-RateLimit-Remaining.</DocP>

      <DocH2>GET /api/plans</DocH2>
      <DocP>List all available plan tiers and defaults.</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`curl https://your-buff.vercel.app/api/plans`} />
      <CodeBlock filename="response.json" lang="typescript" code={`{
  "ok": true,
  "data": {
    "plans": {
      "seed":   { "name": "Seed",   "roundToUsd": 0.05, "buffFeePercent": 1.00 },
      "sprout": { "name": "Sprout", "roundToUsd": 0.10, "buffFeePercent": 0.75 },
      "tree":   { "name": "Tree",   "roundToUsd": 0.50, "buffFeePercent": 0.50 },
      "forest": { "name": "Forest", "roundToUsd": 1.00, "buffFeePercent": 0.25 }
    },
    "ceiling": 1.0,
    "defaultPlan": "sprout",
    "defaultAsset": "BTC",
    "defaultThreshold": 5.0,
    "supportedAssets": ["BTC", "ETH", "SOL", "USDC", "USDT"]
  }
}`} />

      <DocH2>GET /api/price</DocH2>
      <DocP>Get real-time token prices (cached 30s).</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`curl https://your-buff.vercel.app/api/price`} />
      <CodeBlock filename="response.json" lang="typescript" code={`{
  "ok": true,
  "data": {
    "prices": { "SOL": 88.42, "BTC": 71080, "ETH": 2101.15, "USDC": 1.0, "USDT": 1.0 },
    "timestamp": 1710000000000
  }
}`} />

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
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`curl -X POST https://your-buff.vercel.app/api/roundup \\
  -H "Content-Type: application/json" \\
  -d '{"txValueUsd": 27.63, "plan": "tree"}'`} />
      <CodeBlock filename="response.json" lang="typescript" code={`{
  "ok": true,
  "data": {
    "txValueUsd": 27.63,
    "roundToUsd": 0.50,
    "roundedToUsd": 28.00,
    "roundUpUsd": 0.37,
    "roundUpSol": 0.004185,
    "buffFeePercent": 0.50,
    "buffFeeUsd": 0.00185,
    "buffFeeSol": 0.0000209,
    "userInvestmentUsd": 0.36815,
    "userInvestmentSol": 0.004164,
    "solPriceUsd": 88.42,
    "skipped": false,
    "capped": false
  }
}`} />

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
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`curl -X POST https://your-buff.vercel.app/api/swap/quote \\
  -H "Content-Type: application/json" \\
  -d '{"inputLamports": 100000000, "targetAsset": "USDC"}'`} />
      <CodeBlock filename="response.json" lang="typescript" code={`{
  "ok": true,
  "data": {
    "inputLamports": 100000000,
    "inputSol": 0.1,
    "outputAmount": "8847771",
    "targetAsset": "USDC",
    "priceImpact": "0",
    "route": "Raydium → Orca"
  }
}`} />

      <DocH2>POST /api/wallet/derive</DocH2>
      <DocP>Derive a Buff wallet public key from a signature. Returns only the public key — never the private key.</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`curl -X POST https://your-buff.vercel.app/api/wallet/derive \\
  -H "Content-Type: application/json" \\
  -d '{"signature":"base64-encoded-signature"}'`} />
      <CodeBlock filename="response.json" lang="typescript" code={`{
  "ok": true,
  "data": {
    "publicKey": "A2bBXAg4r8Rb2qFoycqBCsDDDmnDEKD8w1V3VPv1eR5T",
    "derivationMessage": "Buff Portfolio Wallet v1"
  }
}`} />

      <DocH2>GET /api/portfolio/:address</DocH2>
      <DocP>Read all token balances and USD values for any Solana wallet.</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`curl "https://your-buff.vercel.app/api/portfolio/E71R6Ph2sS...?network=devnet"`} />
      <CodeBlock filename="response.json" lang="typescript" code={`{
  "ok": true,
  "data": {
    "walletAddress": "E71R6Ph2sS...",
    "network": "devnet",
    "balances": [{ "asset": "BTC", "balance": "0.00068", "usdValue": 48.20 }],
    "totalUsd": 48.20,
    "pendingSol": 0.004617,
    "pendingUsd": 0.41,
    "solPriceUsd": 88.04
  }
}`} />

      <DocH2>GET /api/accumulator/:address</DocH2>
      <DocP>Check if a wallet has reached the investment threshold.</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`curl "https://your-buff.vercel.app/api/accumulator/E71R6Ph2sS...?threshold=5&network=devnet"`} />
      <CodeBlock filename="response.json" lang="typescript" code={`{
  "ok": true,
  "data": {
    "balanceSol": 0.004617,
    "balanceUsd": 0.41,
    "solPriceUsd": 88.04,
    "thresholdUsd": 5.0,
    "thresholdReached": false,
    "remaining": 4.59
  }
}`} />

      <DocH2>POST /api/swap/execute</DocH2>
      <DocP>Submit a pre-signed transaction to the Solana network. The transaction must already be signed — the API just relays it.</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`curl -X POST https://your-buff.vercel.app/api/swap/execute \\
  -H "Content-Type: application/json" \\
  -d '{"signedTransaction":"base64-encoded-tx","network":"mainnet-beta"}'`} />
      <CodeBlock filename="response.json" lang="typescript" code={`{
  "ok": true,
  "data": {
    "txSignature": "4Hkbeas...",
    "confirmed": true,
    "network": "mainnet-beta"
  }
}`} />
    </DocContent>
  );
}
