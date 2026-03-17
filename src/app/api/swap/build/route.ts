import {
  success,
  error,
  getConnection,
  getPrices,
  type NetworkType,
} from "@/lib/api-helpers";
import { requireAuth } from "@/lib/api-auth";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const MAINNET_MINTS: Record<string, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  BTC: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
  ETH: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
};

export async function POST(req: Request) {
  const authError = requireAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      buffWalletPubkey,
      targetAsset = "BTC",
      allocations,
      slippageBps = 100,
      network = "mainnet-beta",
      threshold = 5,
    } = body;

    if (!buffWalletPubkey) {
      return error("buffWalletPubkey is required", 400);
    }

    let walletPk: PublicKey;
    try {
      walletPk = new PublicKey(buffWalletPubkey);
    } catch {
      return error("Invalid buffWalletPubkey", 400);
    }

    // Check balance
    const connection = getConnection(network as NetworkType);
    const balanceLamports = await connection.getBalance(walletPk);
    const balanceSol = balanceLamports / LAMPORTS_PER_SOL;

    const prices = await getPrices();
    const solPrice = prices.SOL || 0;
    const balanceUsd = balanceSol * solPrice;

    if (balanceUsd < threshold) {
      return success({
        ready: false,
        balanceSol,
        balanceUsd,
        threshold,
        remaining: threshold - balanceUsd,
        transactions: [],
      });
    }

    // Reserve rent-exempt minimum (~0.00089 SOL)
    const rentExempt = 890880;
    const availableLamports = Math.max(0, balanceLamports - rentExempt - 10000); // 10k for fees

    if (availableLamports <= 0) {
      return error("Insufficient balance after rent exemption", 400);
    }

    // Resolve allocations
    type Alloc = { asset: string; pct: number };
    const allocs: Alloc[] = allocations && allocations.length > 0
      ? allocations
      : [{ asset: targetAsset, pct: 100 }];

    // Validate allocations sum to 100
    const totalPct = allocs.reduce((s: number, a: Alloc) => s + a.pct, 0);
    if (Math.abs(totalPct - 100) > 0.01) {
      return error("Allocations must sum to 100%", 400);
    }

    // Build a swap transaction for each allocation
    const transactions: Array<{
      asset: string;
      pct: number;
      inputLamports: number;
      transaction: string;
      quote: Record<string, unknown>;
    }> = [];

    for (const alloc of allocs) {
      if (alloc.asset === "SOL") continue; // No swap needed for SOL

      const outputMint = MAINNET_MINTS[alloc.asset];
      if (!outputMint) {
        return error(`Unsupported asset: ${alloc.asset}`, 400);
      }

      const allocLamports = Math.floor(availableLamports * (alloc.pct / 100));
      if (allocLamports < 1000) continue;

      // Get Jupiter quote
      const quoteParams = new URLSearchParams({
        inputMint: MAINNET_MINTS.SOL,
        outputMint,
        amount: allocLamports.toString(),
        slippageBps: slippageBps.toString(),
        onlyDirectRoutes: "false",
        asLegacyTransaction: "false",
      });

      const quoteRes = await fetch(
        `https://lite-api.jup.ag/swap/v1/quote?${quoteParams}`
      );

      if (!quoteRes.ok) {
        return error(
          `Jupiter quote failed for ${alloc.asset}: ${quoteRes.status}`,
          502
        );
      }

      const quoteData = await quoteRes.json();

      // Get swap transaction from Jupiter
      const swapRes = await fetch("https://lite-api.jup.ag/swap/v1/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quoteData,
          userPublicKey: buffWalletPubkey,
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
        }),
      });

      if (!swapRes.ok) {
        return error(
          `Jupiter swap build failed for ${alloc.asset}: ${swapRes.status}`,
          502
        );
      }

      const swapData = await swapRes.json();

      transactions.push({
        asset: alloc.asset,
        pct: alloc.pct,
        inputLamports: allocLamports,
        transaction: swapData.swapTransaction, // base64 unsigned tx
        quote: {
          inputSol: allocLamports / LAMPORTS_PER_SOL,
          outputAmount: quoteData.outAmount,
          outputMint: quoteData.outputMint,
          priceImpact: quoteData.priceImpactPct ?? "0",
          route:
            quoteData.routePlan
              ?.map((r: { swapInfo: { label: string } }) => r.swapInfo.label)
              .join(" → ") ?? "direct",
        },
      });
    }

    return success({
      ready: true,
      balanceSol,
      balanceUsd,
      threshold,
      transactions,
    });
  } catch (err) {
    return error(
      `Swap build failed: ${err instanceof Error ? err.message : "unknown"}`,
      500
    );
  }
}
