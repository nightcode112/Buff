import {
  success,
  error,
  getConnection,
  getPrices,
  type NetworkType,
} from "@/lib/api-helpers";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Public endpoint — read-only balance check
export async function GET(
  req: Request,
  { params }: { params: Promise<{ address: string }> }
) {


  try {
    const { address } = await params;
    const url = new URL(req.url);
    const network = (url.searchParams.get("network") || "mainnet-beta") as NetworkType;
    const threshold = parseFloat(url.searchParams.get("threshold") || "5");

    // Validate address
    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(address);
    } catch {
      return error("Invalid Solana address", 400);
    }

    const connection = getConnection(network);
    const balanceLamports = await connection.getBalance(pubkey);
    const balanceSol = balanceLamports / LAMPORTS_PER_SOL;

    let solPriceUsd = 0;
    try {
      const prices = await getPrices();
      solPriceUsd = prices.SOL || 0;
    } catch {
      // prices unavailable
    }

    const balanceUsd = balanceSol * solPriceUsd;

    return success({
      walletAddress: address,
      network,
      balanceSol,
      balanceUsd,
      solPriceUsd,
      thresholdUsd: threshold,
      thresholdReached: balanceUsd >= threshold,
      remaining: Math.max(0, threshold - balanceUsd),
    });
  } catch (err) {
    return error(
      `Accumulator check failed: ${err instanceof Error ? err.message : "unknown"}`,
      500
    );
  }
}
