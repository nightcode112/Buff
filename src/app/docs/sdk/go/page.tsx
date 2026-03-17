import { DocContent, DocH2, DocP, DocNote, DocTable } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function GoSdkPage() {
  return (
    <DocContent title="Go SDK" description="Full Buff SDK for Go — stdlib-only core, no CGO." badge="SDK">
      <DocH2>Install</DocH2>
      <InstallCommand command="go get github.com/buff-protocol/sdk-go" />

      <DocH2>Quick Start</DocH2>
      <CodeBlock filename="main.go" lang="typescript" code={`package main

import (
    "fmt"
    buff "github.com/buff-protocol/sdk-go"
)

func main() {
    // Calculate round-up
    r := buff.CalculateRoundUp(27.63, 0.50, 1.0)
    fmt.Printf("Round-up: $%.2f\\n", r.RoundUpUsd) // $0.37

    // Full breakdown
    b := buff.CalculateFees(27.63, 150.0, 0.50)
    fmt.Printf("Investing: $%.4f\\n", b.UserInvestmentUsd)
    fmt.Printf("Buff fee: $%.4f\\n", b.BuffFeeUsd)

    // Derive wallet
    sig := make([]byte, 64) // from wallet signMessage
    _, pubkey, _ := buff.DeriveWallet(sig)
    fmt.Printf("Buff wallet: %x\\n", pubkey)
}`} />

      <DocH2>Functions</DocH2>
      <DocTable
        headers={["Function", "Purpose"]}
        rows={[
          ["CalculateRoundUp()", "Fixed-point round-up calculation"],
          ["CalculateFees()", "Full fee breakdown with SOL conversion"],
          ["DeriveWallet()", "SHA-256 + ed25519 keypair from signature"],
          ["GetBuffFeePercent()", "Get fee tier for a round-up increment"],
        ]}
      />

      <DocNote>The Go SDK uses only the standard library (crypto/sha256, crypto/ed25519) for core functionality. No external dependencies for fee calculation and wallet derivation.</DocNote>
    </DocContent>
  );
}
