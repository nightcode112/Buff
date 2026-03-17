---
name: buff-roundup
description: Auto-invest spare change from every transaction. Rounds up payments to the nearest dollar and invests the difference into BTC, ETH, or SOL via Jupiter on Solana. Works with humans (browser wallets), AI agents (headless keypair), and x402 API payments. SDK available in TypeScript, Python, Rust, Go. REST API for any language.
---

# Buff — Round-Up Investing Protocol

Buff rounds up every Solana transaction and auto-invests the spare change into crypto assets.

## Quick Start

```bash
npm install buff-protocol-sdk
```

```typescript
import { Buff } from "buff-protocol-sdk"

// Human user (browser wallet)
const buff = await Buff.init({
  platformId: "your-app",
  signMessage: (msg) => wallet.signMessage(msg),
  plan: "sprout",
  investInto: "BTC",
})

// AI agent (no browser needed)
const buff = await Buff.init({
  agentKeypair: Keypair.generate(),
  platformId: "my-agent",
  agentId: "claude-bot",
  source: "agent",
})
```

## Wrap Transactions

```typescript
// Wrap a Solana transaction (human or agent)
const { transaction, breakdown } = await buff.wrap(tx, pubkey, {
  txValueUsd: 27.63,
})
// $27.63 → $28.00 = $0.37 round-up → invested into BTC

// Agent: record round-up without a transaction
const { breakdown } = await buff.wrapAmount({
  txValueUsd: 0.50,
  source: "agent",
})
```

## x402 Middleware

```typescript
import { createX402Fetch } from "buff-protocol-sdk"

const x402Fetch = createX402Fetch(buff, { autoPay: true, maxPaymentUsd: 1.00 })
const res = await x402Fetch("https://api.example.com/data")
// Auto-pays HTTP 402 responses + rounds up the payment
```

## Auto-Invest

```typescript
const { swaps } = await buff.checkAndInvest()
// When $5 accumulated → swaps SOL to BTC/ETH via Jupiter
```

## Multi-Asset Allocation

```typescript
buff.setAllocations([
  { asset: "BTC", pct: 60 },
  { asset: "ETH", pct: 40 },
])
```

## Plan Tiers

| Plan | Rounds to | Fee |
|------|-----------|-----|
| Seed | $0.05 | 1.00% |
| Sprout | $0.10 | 0.75% |
| Tree | $0.50 | 0.50% |
| Forest | $1.00 | 0.25% |

## REST API

No SDK needed — any language, any agent:

```bash
# Calculate round-up
curl -X POST https://buff.finance/api/roundup \
  -H "x-wallet: YOUR_PUBKEY" \
  -H "x-signature: YOUR_SIG" \
  -d '{"txValueUsd": 27.63, "plan": "tree"}'

# Get swap quote
curl -X POST https://buff.finance/api/swap/quote \
  -H "x-api-key: YOUR_KEY" \
  -d '{"inputLamports": 100000000, "targetAsset": "BTC"}'

# Check portfolio
curl https://buff.finance/api/portfolio/WALLET_ADDRESS

# Auth: sign "Buff API Authentication" with your Solana wallet
curl https://buff.finance/api/auth
```

## SDKs

- **TypeScript**: `npm install buff-protocol-sdk`
- **Python**: `pip install buff-sdk`
- **Rust**: `cargo add buff-sdk`
- **Go**: `go get github.com/buff-protocol/sdk-go`

## Links

- Docs: https://buff.finance/docs
- Dashboard: https://buff.finance/dashboard
- API Reference: https://buff.finance/docs/api/rest
- GitHub: https://github.com/nightcode112/Buff
