import { DocContent, DocH2, DocP, DocNote, DocTable } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function PythonSdkPage() {
  return (
    <DocContent title="Python SDK" description="Use the Buff API from Python via the REST endpoints." badge="SDK">
      <DocH2>Install</DocH2>
      <InstallCommand command="pip install requests" />

      <DocH2>Quick Start</DocH2>
      <CodeBlock filename="main.py" lang="typescript" code={`import requests

API = "https://buff.finance"
HEADERS = {"x-api-key": "YOUR_API_KEY", "Content-Type": "application/json"}

# Calculate a round-up
res = requests.post(f"{API}/api/roundup", json={
    "txValueUsd": 27.63,
    "plan": "sprout"
}, headers=HEADERS)
data = res.json()["data"]
print(f"Round-up: \${data['roundUpUsd']}")  # $0.07

# Get wrap instructions (server builds transfers with fees)
res = requests.post(f"{API}/api/wrap", json={
    "txValueUsd": 27.63,
    "userPubkey": "YOUR_PUBKEY",
    "buffWalletPubkey": "BUFF_WALLET_PUBKEY",
    "plan": "sprout"
}, headers=HEADERS)
wrap = res.json()["data"]
print(f"Instructions: {len(wrap['instructions'])}")
print(f"Fee: {wrap['breakdown']['buffFeeLamports']} lamports")

# Check portfolio
res = requests.get(f"{API}/api/portfolio/YOUR_WALLET_ADDRESS")
portfolio = res.json()["data"]
print(f"Pending: {portfolio['pendingSol']} SOL")

# Check accumulator & build swap
res = requests.get(f"{API}/api/accumulator/BUFF_WALLET?threshold=5")
acc = res.json()["data"]
if acc["thresholdReached"]:
    res = requests.post(f"{API}/api/swap/build", json={
        "buffWalletPubkey": "BUFF_WALLET",
        "targetAsset": "BTC",
        "threshold": 5
    }, headers=HEADERS)
    swaps = res.json()["data"]
    print(f"Ready: {swaps['ready']}, txs: {len(swaps['transactions'])}")`} />

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

      <DocNote>All fee logic runs server-side. The Python client just calls the REST API — no sensitive logic needed. Auth via API key or wallet signature headers.</DocNote>
    </DocContent>
  );
}
