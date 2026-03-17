import { DocContent, DocH2, DocP, DocNote, DocTable } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function GoSdkPage() {
  return (
    <DocContent title="Go SDK" description="Use the Buff API from Go via the REST endpoints." badge="SDK">
      <DocH2>Install</DocH2>
      <DocP>No external dependencies needed — just <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">net/http</code> and <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">encoding/json</code>.</DocP>

      <DocH2>Quick Start</DocH2>
      <CodeBlock filename="main.go" lang="typescript" code={`package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "io"
)

const api = "https://buff.finance"
const apiKey = "YOUR_API_KEY"

func buffPost(path string, body map[string]interface{}) map[string]interface{} {
    data, _ := json.Marshal(body)
    req, _ := http.NewRequest("POST", api+path, bytes.NewBuffer(data))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("x-api-key", apiKey)
    resp, _ := http.DefaultClient.Do(req)
    defer resp.Body.Close()
    raw, _ := io.ReadAll(resp.Body)
    var result map[string]interface{}
    json.Unmarshal(raw, &result)
    return result["data"].(map[string]interface{})
}

func main() {
    // Calculate round-up
    data := buffPost("/api/roundup", map[string]interface{}{
        "txValueUsd": 27.63,
        "plan":       "sprout",
    })
    fmt.Printf("Round-up: $%v\\n", data["roundUpUsd"]) // $0.07

    // Get wrap instructions (server builds transfers with fees)
    wrap := buffPost("/api/wrap", map[string]interface{}{
        "txValueUsd":      27.63,
        "userPubkey":      "YOUR_PUBKEY",
        "buffWalletPubkey": "BUFF_WALLET",
        "plan":            "sprout",
    })
    breakdown := wrap["breakdown"].(map[string]interface{})
    fmt.Printf("Fee: %v lamports\\n", breakdown["buffFeeLamports"])

    // Build swap
    swap := buffPost("/api/swap/build", map[string]interface{}{
        "buffWalletPubkey": "BUFF_WALLET",
        "targetAsset":      "BTC",
        "threshold":        5,
    })
    fmt.Printf("Ready: %v\\n", swap["ready"])
}`} />

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

      <DocNote>All fee logic runs server-side. The Go client just calls the REST API — stdlib only, no external dependencies. Auth via API key or wallet signature headers.</DocNote>
    </DocContent>
  );
}
