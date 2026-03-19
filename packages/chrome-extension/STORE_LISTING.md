# Chrome Web Store Listing

## Name
Buff — Auto Round-Up Investing

## Short Description (132 chars max)
Round up every Solana transaction and auto-invest the spare change into BTC, ETH, and more. One signature. Zero friction.

## Detailed Description

Buff automatically rounds up your Solana transactions and invests the spare change into crypto assets like BTC, ETH, SOL, and USDC.

HOW IT WORKS
When you swap on Jupiter, bid on Tensor, or use any Solana dApp, Buff rounds up the transaction to the nearest dollar (or more, depending on your plan). The round-up is added to the same transaction — you sign once in Phantom, and the spare change flows into your self-custodial Buff wallet.

Example: You swap $7.30 on Jupiter. Buff rounds up to $8.00. The extra $0.70 is invested into your chosen assets. One Phantom popup. One signature. Done.

FEATURES
- Works on ANY Solana dApp — Jupiter, Raydium, Tensor, Magic Eden, and more
- One transaction — round-up is appended to your existing transaction, not a separate one
- Self-custodial — your Buff wallet is yours. Export the private key anytime
- Four plans — Seed ($0.50), Sprout ($1), Tree ($5), Forest ($10) round-up increments
- Multi-asset allocation — split round-ups across BTC, ETH, SOL, and USDC
- Fail-open safety — if anything goes wrong, your transaction goes through unmodified
- Dashboard — track your portfolio, pending round-ups, and investment progress

SECURITY
- Your private keys never leave your device
- API keys are stored in the extension's sandboxed storage, never accessible to websites
- All API communication is encrypted via HTTPS
- Every transaction modification is visible in your wallet's signing popup before you approve
- Open architecture — all instructions are validated as SystemProgram transfers

SUPPORTED WALLETS
- Phantom
- Solflare
- Backpack

Learn more at buff.finance

## Category
Productivity (or Finance if available)

## Language
English

## Privacy Policy URL
https://buff.finance/privacy

## Permission Justifications

### storage
Store user settings (plan, ceiling, allocations), authentication credentials (wallet address, API key), and round-up statistics locally in the extension.

### activeTab / tabs
Required to communicate with the active tab during the wallet connection setup flow. The popup UI sends messages through the background service worker to the content script on the active tab to interact with the user's Solana wallet provider.

### Content scripts on all URLs (<all_urls>)
Solana dApps exist on any domain — there is no fixed list. The extension must inject its wallet interception script on every page to detect and wrap Solana wallet signing calls (window.solana.signTransaction). The content script only activates when a Solana wallet provider is detected on the page. No page content, URLs, or browsing history is collected.

### host_permissions: buff.finance
The extension makes authenticated API requests to buff.finance to calculate round-up amounts, fetch cryptocurrency prices, and retrieve portfolio data.

## Screenshots Needed
1. Popup showing the Home tab with round-up stats
2. Popup showing the Plan selection grid
3. Popup showing the Allocation picker
4. Popup showing the Portfolio view
5. A Phantom signing popup showing the original swap + round-up transfers

## Promotional Tile (440x280)
Blue gradient background with Buff logo and tagline "Round up. Invest. Grow."

## Small Tile (920x680)
Extension popup screenshot overlaid on a Jupiter swap page
