import { success, error } from "@/lib/api-helpers";
import { getAuthMessage } from "@/lib/api-auth";

// GET /api/auth — returns the message to sign
export async function GET() {
  return success({
    message: getAuthMessage(),
    instructions: "Sign this message with your Solana wallet, then send the signature in the x-signature header and your pubkey in the x-wallet header on protected endpoints.",
    example: {
      headers: {
        "x-wallet": "<your-base58-pubkey>",
        "x-signature": "<base64-signature-of-message>",
      },
    },
  });
}

// POST /api/auth — verify a signature (test if your auth works)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wallet, signature } = body;

    if (!wallet || !signature) {
      return error("wallet and signature are required", 400);
    }

    const { PublicKey } = require("@solana/web3.js");
    const nacl = require("tweetnacl");

    const pubkey = new PublicKey(wallet);
    const message = new TextEncoder().encode(getAuthMessage());
    const sigBytes = Buffer.from(signature, "base64");

    const valid = nacl.sign.detached.verify(
      message,
      sigBytes,
      pubkey.toBytes()
    );

    if (valid) {
      return success({
        authenticated: true,
        wallet,
        message: "Signature verified. Use these headers on protected endpoints.",
        headers: {
          "x-wallet": wallet,
          "x-signature": signature,
        },
      });
    }

    return error("Invalid signature", 403);
  } catch (err) {
    return error(
      `Verification failed: ${err instanceof Error ? err.message : "unknown"}`,
      400
    );
  }
}
