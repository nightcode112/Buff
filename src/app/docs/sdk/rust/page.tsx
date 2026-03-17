import { DocContent, DocH2, DocP, DocNote, DocTable } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

const RUST_EXAMPLE = `use buff_sdk::{fee, wallet};

fn main() {
    // Calculate round-up
    let r = fee::calculate_round_up(27.63, 0.50, 1.0);
    println!("Round-up: {}", r.round_up_usd); // 0.37

    // Full breakdown
    let b = fee::calculate_fees(27.63, 150.0, 0.50);
    println!("Investing: {}", b.user_investment_usd);
    println!("Buff fee: {}", b.buff_fee_usd);

    // Derive wallet
    let sig = vec![1u8; 64];
    let keypair = wallet::derive_wallet(&sig).unwrap();
    println!("Buff wallet: {}", keypair.pubkey());
}`;

export default function RustSdkPage() {
  return (
    <DocContent title="Rust SDK" description="Full Buff SDK for Rust — zero-copy, async-ready." badge="SDK">
      <DocH2>Install</DocH2>
      <InstallCommand command='cargo add buff-sdk' />
      <DocP>For network features (Jupiter, RPC):</DocP>
      <InstallCommand command='cargo add buff-sdk --features network' />

      <DocH2>Quick Start</DocH2>
      <CodeBlock filename="main.rs" lang="typescript" code={RUST_EXAMPLE} />

      <DocH2>Modules</DocH2>
      <DocTable
        headers={["Module", "Purpose"]}
        rows={[
          ["buff_sdk::fee", "calculate_round_up(), calculate_fees()"],
          ["buff_sdk::wallet", "derive_wallet() — sha2 + solana-keypair"],
          ["buff_sdk::config", "PlanTier enum, token mints, fee tiers"],
          ["buff_sdk::errors", "BuffError enum (thiserror)"],
          ["buff_sdk::price", "PriceService (feature: network)"],
          ["buff_sdk::swap", "Jupiter integration (feature: network)"],
        ]}
      />

      <DocNote>Core modules (fee, wallet, config, errors) have zero network dependencies. Enable the &quot;network&quot; feature for price fetching and Jupiter swaps.</DocNote>
    </DocContent>
  );
}
