// ── Shared API helpers ──

import { NextResponse } from "next/server";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createHash } from "crypto";

export function success(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

// CoinGecko price fetching with global cache (persists across requests in same instance)
// Uses 120s TTL + stale fallback on errors + retry on 429

const globalCache = globalThis as unknown as {
  __buffPriceCache?: { prices: Record<string, number>; fetchedAt: number };
};

const PRICE_TTL = 120_000; // 2 minutes — reduces CoinGecko calls significantly

const MINT_TO_CG: Record<string, string> = {
  SOL: "solana",
  BTC: "bitcoin",
  ETH: "ethereum",
  USDC: "usd-coin",
  USDT: "tether",
};

export async function getPrices(): Promise<Record<string, number>> {
  // Check global cache (survives across requests in same serverless instance)
  const cached = globalCache.__buffPriceCache;
  if (cached && Date.now() - cached.fetchedAt < PRICE_TTL) {
    return cached.prices;
  }

  const ids = Object.values(MINT_TO_CG).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

  // Retry up to 2 times on 429
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);

      if (res.status === 429) {
        // Rate limited — use stale cache if available
        if (cached) return cached.prices;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        throw new Error("CoinGecko rate limited (429)");
      }

      if (!res.ok) {
        if (cached) return cached.prices;
        throw new Error(`CoinGecko returned ${res.status}`);
      }

      const data = await res.json();
      const prices: Record<string, number> = {};

      for (const [symbol, cgId] of Object.entries(MINT_TO_CG)) {
        prices[symbol] = data[cgId]?.usd ?? 0;
      }

      globalCache.__buffPriceCache = { prices, fetchedAt: Date.now() };
      return prices;
    } catch (err) {
      if (cached) return cached.prices;
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Should never reach here, but fallback
  if (cached) return cached.prices;
  throw new Error("Failed to fetch prices");
}

// Round-up calculation (same logic as SDK)
export function calculateRoundUp(
  txValueUsd: number,
  roundToUsd: number,
  ceiling: number = 1.0
): {
  roundUpUsd: number;
  roundedToUsd: number;
  skipped: boolean;
  capped: boolean;
} {
  const scale = 1_000_000;
  const sv = Math.round(txValueUsd * scale);
  const sr = Math.round(roundToUsd * scale);
  const rem = sv % sr;

  if (rem === 0) {
    return { roundUpUsd: 0, roundedToUsd: txValueUsd, skipped: true, capped: false };
  }

  const raw = (sr - rem) / scale;

  if (raw > ceiling) {
    return { roundUpUsd: ceiling, roundedToUsd: txValueUsd + ceiling, skipped: false, capped: true };
  }

  return { roundUpUsd: raw, roundedToUsd: txValueUsd + raw, skipped: false, capped: false };
}

export function getBuffFeePercent(roundToUsd: number): number {
  if (roundToUsd >= 1.0) return 0.25;
  if (roundToUsd >= 0.5) return 0.5;
  if (roundToUsd >= 0.1) return 0.75;
  return 1.0;
}

// ── Solana RPC Connection ──
export type NetworkType = "mainnet-beta" | "devnet";

const RPC_URLS: Record<NetworkType, string> = {
  "mainnet-beta": process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
};

export function getConnection(network: NetworkType = "mainnet-beta") {
  return new Connection(RPC_URLS[network], "confirmed");
}

// ── Token Mints ──
export const TOKEN_MINTS: Record<string, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  BTC: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
  ETH: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
};

// ── Wallet Derivation (server-side) ──
export function deriveWalletPubkey(signatureBytes: Uint8Array): string {
  const seed = createHash("sha256").update(signatureBytes).digest();
  // Solana keypair from 32-byte seed — import dynamically to avoid bundle issues
  const { Keypair } = require("@solana/web3.js");
  const kp = Keypair.fromSeed(seed);
  return kp.publicKey.toBase58();
}

// ── Plans ──
export const PLANS = {
  seed: { name: "Seed", roundToUsd: 0.05, buffFeePercent: 1.0 },
  sprout: { name: "Sprout", roundToUsd: 0.10, buffFeePercent: 0.75 },
  tree: { name: "Tree", roundToUsd: 0.50, buffFeePercent: 0.5 },
  forest: { name: "Forest", roundToUsd: 1.00, buffFeePercent: 0.25 },
};
