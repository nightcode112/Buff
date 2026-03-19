import { success, error } from "@/lib/api-helpers";
import { deriveApiKey } from "@/lib/api-auth";
import { PublicKey } from "@solana/web3.js";

const AUTH_MESSAGE = "Buff API Authentication";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wallet, signature } = body;

    if (!wallet || !signature) {
      return error(
        'wallet (base58 pubkey) and signature (base64) are required. Sign the message: "Buff API Authentication"',
        400
      );
    }

    // Validate pubkey
    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(wallet);
    } catch {
      return error("Invalid wallet address", 400);
    }

    // Verify signature
    const nacl = require("tweetnacl");
    const message = new TextEncoder().encode(AUTH_MESSAGE);
    let sigBytes: Uint8Array;
    try {
      sigBytes = new Uint8Array(Buffer.from(signature, "base64"));
    } catch {
      return error("Invalid signature encoding — use base64", 400);
    }

    const valid = nacl.sign.detached.verify(
      message,
      sigBytes,
      pubkey.toBytes()
    );

    if (!valid) {
      return error(
        'Invalid signature. Sign exactly: "Buff API Authentication"',
        403
      );
    }

    // Generate deterministic API key
    const apiKey = deriveApiKey(wallet);

    return success({
      apiKey,
      wallet,
      usage: {
        headers: {
          "x-api-key": apiKey,
          "x-wallet": wallet,
        },
        note: "Include both x-api-key and x-wallet headers on all authenticated requests.",
      },
    });
  } catch (err) {
    return error(
      `Key generation failed: ${err instanceof Error ? err.message : "unknown"}`,
      500
    );
  }
}
