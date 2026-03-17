import { DocContent, DocH2, DocP, DocNote } from "@/components/docs/doc-layout";
import { CodeBlock } from "@/components/docs/code-block";

const PYTHON_CODE = `import requests

BUFF_API = "https://buff.finance"

def calculate_roundup(tx_value_usd: float, plan: str = "sprout"):
    """Calculate the round-up for a transaction."""
    res = requests.post(f"{BUFF_API}/api/roundup", json={
        "txValueUsd": tx_value_usd,
        "plan": plan,
    })
    data = res.json()
    if not data["ok"]:
        raise Exception(data["error"])
    return data["data"]

def get_prices():
    """Get current token prices."""
    res = requests.get(f"{BUFF_API}/api/price")
    return res.json()["data"]["prices"]

def get_swap_quote(input_lamports: int, asset: str = "BTC"):
    """Get a Jupiter swap quote."""
    res = requests.post(f"{BUFF_API}/api/swap/quote", json={
        "inputLamports": input_lamports,
        "targetAsset": asset,
    })
    return res.json()["data"]

# Usage
breakdown = calculate_roundup(27.63, "tree")
print(f"Tx: \${breakdown['txValueUsd']}")
print(f"Round-up: \${breakdown['roundUpUsd']}")
print(f"Investing: \${breakdown['userInvestmentUsd']}")
print(f"Buff fee: \${breakdown['buffFeeUsd']}")

# Get swap quote
quote = get_swap_quote(100_000_000, "USDC")  # 0.1 SOL
print(f"Route: {quote['route']}")
print(f"Expected output: {quote['outputAmount']}")`;

const RUST_CODE = `use reqwest::Client;
use serde::Deserialize;
use serde_json::json;

const BUFF_API: &str = "https://buff.finance";

#[derive(Debug, Deserialize)]
struct ApiResponse {
    ok: bool,
    data: RoundUpData,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RoundUpData {
    round_up_usd: f64,
    user_investment_usd: f64,
    skipped: bool,
}

async fn calculate_roundup(
    client: &Client, tx_value: f64, plan: &str,
) -> Result<RoundUpData, Box<dyn std::error::Error>> {
    let res: ApiResponse = client
        .post(format!("{}/api/roundup", BUFF_API))
        .json(&json!({"txValueUsd": tx_value, "plan": plan}))
        .send().await?
        .json().await?;
    Ok(res.data)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let b = calculate_roundup(&client, 27.63, "tree").await?;
    println!("Round-up: {}", b.round_up_usd);
    println!("Investing: {}", b.user_investment_usd);
    println!("Skipped: {}", b.skipped);
    Ok(())
}`;

const GO_CODE = 'package main\n\nimport (\n\t"bytes"\n\t"encoding/json"\n\t"fmt"\n\t"net/http"\n)\n\nconst buffAPI = "https://buff.finance"\n\ntype RoundUpRequest struct {\n\tTxValueUsd float64 `json:"txValueUsd"`\n\tPlan       string  `json:"plan"`\n}\n\ntype RoundUpData struct {\n\tRoundUpUsd        float64 `json:"roundUpUsd"`\n\tUserInvestmentUsd float64 `json:"userInvestmentUsd"`\n\tSkipped           bool    `json:"skipped"`\n}\n\ntype Response struct {\n\tOk   bool        `json:"ok"`\n\tData RoundUpData `json:"data"`\n}\n\nfunc calculateRoundUp(txValue float64, plan string) (*RoundUpData, error) {\n\tbody, _ := json.Marshal(RoundUpRequest{\n\t\tTxValueUsd: txValue,\n\t\tPlan:       plan,\n\t})\n\n\tresp, err := http.Post(\n\t\tbuffAPI+"/api/roundup",\n\t\t"application/json",\n\t\tbytes.NewReader(body),\n\t)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tdefer resp.Body.Close()\n\n\tvar result Response\n\tjson.NewDecoder(resp.Body).Decode(&result)\n\treturn &result.Data, nil\n}\n\nfunc main() {\n\tb, err := calculateRoundUp(27.63, "tree")\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\n\tfmt.Printf("Round-up: $%.2f\\n", b.RoundUpUsd)\n\tfmt.Printf("Investing: $%.4f\\n", b.UserInvestmentUsd)\n\tfmt.Printf("Skipped: %v\\n", b.Skipped)\n}';

export default function ExamplesPage() {
  return (
    <DocContent title="Multi-Language Examples" description="Use the Buff REST API from any language. No SDK needed — just HTTP." badge="Examples">
      <DocNote>These examples use the REST API. Replace the base URL with your deployed Buff instance.</DocNote>

      <DocH2>Python</DocH2>
      <CodeBlock filename="buff_roundup.py" lang="typescript" code={PYTHON_CODE} />

      <DocH2>Rust</DocH2>
      <CodeBlock filename="buff.rs" lang="typescript" code={RUST_CODE} />

      <DocH2>Go</DocH2>
      <CodeBlock filename="buff.go" lang="typescript" code={GO_CODE} />

      <DocH2>cURL</DocH2>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`# Calculate round-up
curl -s -X POST https://buff.finance/api/roundup \\
  -H "Content-Type: application/json" \\
  -d '{"txValueUsd": 27.63, "plan": "tree"}' | jq .data

# Get prices
curl -s https://buff.finance/api/price | jq .data.prices

# Get swap quote
curl -s -X POST https://buff.finance/api/swap/quote \\
  -H "Content-Type: application/json" \\
  -d '{"inputLamports": 100000000, "targetAsset": "USDC"}' | jq .data`} />
    </DocContent>
  );
}
