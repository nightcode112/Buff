import { DocContent, DocH2, DocP, DocNote, DocTable } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

const RUST_EXAMPLE = [
  'use reqwest::Client;',
  'use serde_json::{json, Value};',
  '',
  'const API: &str = "https://buff.finance";',
  'const API_KEY: &str = "YOUR_API_KEY";',
  '',
  '#[tokio::main]',
  'async fn main() -> Result<(), Box<dyn std::error::Error>> {',
  '    let client = Client::new();',
  '',
  '    // Calculate round-up',
  '    let url = format!("{}/api/roundup", API);',
  '    let res: Value = client.post(&url)',
  '        .header("x-api-key", API_KEY)',
  '        .json(&json!({"txValueUsd": 27.63, "plan": "sprout"}))',
  '        .send().await?.json().await?;',
  '    println!("Round-up: {}", res["data"]["roundUpUsd"]); // 0.07',
  '',
  '    // Get wrap instructions (server builds transfers with fees)',
  '    let url = format!("{}/api/wrap", API);',
  '    let res: Value = client.post(&url)',
  '        .header("x-api-key", API_KEY)',
  '        .json(&json!({',
  '            "txValueUsd": 27.63,',
  '            "userPubkey": "YOUR_PUBKEY",',
  '            "buffWalletPubkey": "BUFF_WALLET",',
  '            "plan": "sprout"',
  '        }))',
  '        .send().await?.json().await?;',
  '    let ix = res["data"]["instructions"].as_array().unwrap();',
  '    println!("Instructions: {}", ix.len());',
  '',
  '    // Build swap when threshold reached',
  '    let url = format!("{}/api/swap/build", API);',
  '    let res: Value = client.post(&url)',
  '        .header("x-api-key", API_KEY)',
  '        .json(&json!({',
  '            "buffWalletPubkey": "BUFF_WALLET",',
  '            "targetAsset": "BTC",',
  '            "threshold": 5',
  '        }))',
  '        .send().await?.json().await?;',
  '    println!("Ready: {}", res["data"]["ready"]);',
  '',
  '    Ok(())',
  '}',
].join('\n');

export default function RustSdkPage() {
  return (
    <DocContent title="Rust SDK" description="Use the Buff API from Rust via the REST endpoints." badge="SDK">
      <DocH2>Install</DocH2>
      <InstallCommand command="cargo add reqwest serde_json tokio --features tokio/full,reqwest/json" />

      <DocH2>Quick Start</DocH2>
      <CodeBlock filename="main.rs" lang="typescript" code={RUST_EXAMPLE} />

      <DocH2>Endpoints</DocH2>
      <DocTable
        headers={["Endpoint", "Method", "Purpose"]}
        rows={[
          ["POST /api/roundup", "Authenticated", "Calculate round-up breakdown"],
          ["POST /api/wrap", "Authenticated", "Get transfer instructions with fees enforced"],
          ["POST /api/swap/build", "Authenticated", "Build Jupiter swap transactions"],
          ["POST /api/swap/execute", "Authenticated", "Execute signed swap transaction"],
          ["GET /api/portfolio/:addr", "Public", "Get wallet token balances"],
          ["GET /api/accumulator/:addr", "Public", "Check balance vs threshold"],
          ["GET /api/plans", "Public", "Get plan tiers and config"],
          ["GET /api/price", "Public", "Get current crypto prices"],
        ]}
      />

      <DocNote>All fee logic runs server-side. The Rust client just calls the REST API. Auth via API key or wallet signature headers.</DocNote>
    </DocContent>
  );
}
