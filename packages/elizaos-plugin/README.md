# buff-elizaos-plugin

Buff round-up investing plugin for ElizaOS. Auto-invests spare change from every agent transaction into crypto assets via Jupiter on Solana. All fees enforced server-side.

## Install

```bash
npm install buff-elizaos-plugin
```

## Configure

Set environment variables:

```bash
BUFF_API_KEY=your-api-key              # Get from buff.finance/dashboard
BUFF_WALLET_PUBKEY=your-buff-wallet    # Your Buff wallet Solana address
BUFF_PLAN=sprout                       # seed|sprout|tree|forest
BUFF_INVEST_INTO=BTC                   # BTC|ETH|SOL|USDC
BUFF_THRESHOLD=5                       # USD threshold before auto-swap
```

## Add to your character

```json
{
  "name": "my-agent",
  "plugins": ["buff-elizaos-plugin"]
}
```

## Actions

| Action | Trigger | Description |
|--------|---------|-------------|
| `BUFF_ROUNDUP` | "round up my $4.73 transaction" | Calculate a round-up |
| `BUFF_INVEST` | "check my Buff investments" | Check threshold & build swap |
| `BUFF_PORTFOLIO` | "show my Buff portfolio" | View wallet balances |
| `BUFF_SET_PLAN` | "set plan to tree" | Change round-up tier |
| `BUFF_SET_ALLOC` | "set allocation 60% BTC 40% ETH" | Set portfolio split |

## Provider

The `buffPortfolioProvider` automatically injects portfolio context into agent conversations, so the agent knows its investment status.

## How It Works

1. Agent makes transactions (swaps, API calls, payments)
2. Each transaction is rounded up via the Buff API
3. Spare change accumulates in the agent's Buff wallet
4. When threshold is reached → server builds Jupiter swap transactions
5. Agent signs and executes → crypto portfolio grows passively

## Links

- [Buff Docs](https://buff.finance/docs)
- [Buff Dashboard](https://buff.finance/dashboard)
- [GitHub](https://github.com/nightcode112/Buff)

## License

MIT
