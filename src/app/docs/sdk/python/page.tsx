import { DocContent, DocH2, DocP, DocNote, DocTable } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function PythonSdkPage() {
  return (
    <DocContent title="Python SDK" description="Full Buff SDK for Python — same features as the TypeScript SDK." badge="SDK">
      <DocH2>Install</DocH2>
      <InstallCommand command="pip install buff-sdk" />

      <DocH2>Quick Start</DocH2>
      <CodeBlock filename="main.py" lang="typescript" code={`from buff import calculate_round_up, calculate_fees, derive_wallet, PriceService

# Calculate a round-up
round_up, rounded_to, skipped, capped = calculate_round_up(27.63, 0.50)
print(f"Round-up: \${round_up}")  # $0.37

# Full fee breakdown with real SOL price
price_service = PriceService()
sol_price = price_service.get_sol_price()
breakdown = calculate_fees(27.63, sol_price, 0.50)
print(f"Investing: \${breakdown.user_investment_usd}")

# Derive Buff wallet (same as TypeScript SDK)
signature = wallet.sign_message(b"Buff Portfolio Wallet v1")
keypair = derive_wallet(signature)
print(f"Buff wallet: {keypair.pubkey()}")`} />

      <DocH2>Modules</DocH2>
      <DocTable
        headers={["Module", "Purpose"]}
        rows={[
          ["buff.fee", "calculate_round_up(), calculate_fees() — fixed-point math"],
          ["buff.wallet", "derive_wallet() — SHA-256 + Solana keypair from signature"],
          ["buff.config", "PLAN_TIERS, token mints, RPC URLs, fee tiers"],
          ["buff.price", "PriceService — CoinGecko with TTL caching"],
          ["buff.swap", "get_swap_quote() — Jupiter integration via httpx"],
          ["buff.portfolio", "get_portfolio() — read onchain token balances"],
          ["buff.events", "BuffEventEmitter — on/off/emit"],
          ["buff.errors", "BuffError, BuffPriceError, BuffSwapError, etc."],
        ]}
      />

      <DocNote>The Python SDK produces the same deterministic wallet as the TypeScript SDK — same signature input always generates the same Buff wallet across languages.</DocNote>
    </DocContent>
  );
}
