# buff-protocol-sdk

Buff rounds up every Solana transaction and auto-invests the spare change into crypto assets via Jupiter.

## Install

```bash
npm install buff-protocol-sdk
```

## Quick Start

```typescript
import { Buff } from "buff-protocol-sdk"

const buff = new Buff({
  apiKey: "your-api-key",
  plan: "sprout",
  investInto: "BTC",
})

// Get wrap instructions (server builds transfer instructions with fees enforced)
const { instructions, breakdown } = await buff.getWrapInstructions(
  27.63,          // tx value in USD
  userPubkey,     // user's main wallet
  buffWalletPk,   // user's Buff wallet
)
// Append instructions to your transaction, sign, and send

// Check if threshold reached, build swap transaction
const result = await buff.buildSwap(buffWalletPk)
if (result.ready) {
  // Sign each transaction with Buff wallet, then execute
  for (const swap of result.transactions) {
    const signed = signTransaction(swap.transaction)
    await buff.executeSwap(signed)
  }
}
```

## How It Works

All fee calculation, treasury addresses, and swap routing are handled **server-side** by the Buff API. The SDK is a typed HTTP client — it never contains sensitive logic.

1. `getWrapInstructions()` → Server calculates round-up, builds SOL transfer instructions with fees
2. You append instructions to your transaction and sign
3. `buildSwap()` → Server checks balance, builds Jupiter swap transactions
4. You sign and call `executeSwap()` → Server validates fee inclusion, sends to network

## API Reference

See full docs at [buff.finance/docs](https://buff.finance/docs)

## License

MIT
