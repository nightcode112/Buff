// ── API Authentication ──
//
// Two auth methods:
// 1. Static API key (BUFF_API_KEY env var) — for internal/admin use
// 2. Wallet signature — for platforms/users. Sign "Buff API Authentication"
//    with your Solana wallet, send the signature as auth token.
//
// Header: x-api-key: <static-key>
// OR
// Header: x-wallet: <base58-pubkey>
// Header: x-signature: <base64-signature>

import { NextResponse } from "next/server";

const AUTH_MESSAGE = "Buff API Authentication";

export function requireAuth(req: Request): NextResponse | null {
  // Method 1: Static API key
  const apiKey = process.env.BUFF_API_KEY?.trim();
  const providedKey = req.headers.get("x-api-key");

  if (providedKey && apiKey && providedKey === apiKey) {
    return null;
  }

  // Method 2: Wallet signature
  const wallet = req.headers.get("x-wallet");
  const signature = req.headers.get("x-signature");

  if (wallet && signature) {
    try {
      const { PublicKey } = require("@solana/web3.js");
      const nacl = require("tweetnacl");

      const pubkey = new PublicKey(wallet);
      const message = new TextEncoder().encode(AUTH_MESSAGE);
      const sigBytes = Buffer.from(signature, "base64");

      const valid = nacl.sign.detached.verify(
        message,
        sigBytes,
        pubkey.toBytes()
      );

      if (valid) return null;

      return NextResponse.json(
        { ok: false, error: "Invalid signature" },
        { status: 403 }
      );
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid wallet or signature format" },
        { status: 400 }
      );
    }
  }

  if (providedKey && apiKey) {
    return NextResponse.json(
      { ok: false, error: "Invalid API key" },
      { status: 403 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Auth required. Use x-api-key OR x-wallet + x-signature headers.",
    },
    { status: 401 }
  );
}

export function getAuthMessage(): string {
  return AUTH_MESSAGE;
}
