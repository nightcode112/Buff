import { success, error, deriveWalletPubkey } from "@/lib/api-helpers";

// Public endpoint — only returns a pubkey, no sensitive data
export async function POST(req: Request) {

  try {
    const body = await req.json();
    const { signature } = body;

    if (!signature) {
      return error("signature is required (base64 or hex string)", 400);
    }

    // Decode signature — accept base64 or hex
    let sigBytes: Uint8Array;
    try {
      if (/^[0-9a-fA-F]+$/.test(signature)) {
        sigBytes = new Uint8Array(Buffer.from(signature, "hex"));
      } else {
        sigBytes = new Uint8Array(Buffer.from(signature, "base64"));
      }
    } catch {
      return error("Invalid signature encoding — use base64 or hex", 400);
    }

    if (sigBytes.length === 0) {
      return error("Signature is empty", 400);
    }

    const publicKey = deriveWalletPubkey(sigBytes);

    return success({
      publicKey,
      derivationMessage: "Buff Portfolio Wallet v1",
    });
  } catch (err) {
    return error(
      `Derivation failed: ${err instanceof Error ? err.message : "unknown"}`,
      500
    );
  }
}
