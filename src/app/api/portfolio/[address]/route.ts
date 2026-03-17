import {
  success,
  error,
  getConnection,
  getPrices,
  TOKEN_MINTS,
  type NetworkType,
} from "@/lib/api-helpers";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Public endpoint — read-only, same as looking up any wallet on Solscan
export async function GET(
  req: Request,
  { params }: { params: Promise<{ address: string }> }
) {

  try {
    const { address } = await params;
    const url = new URL(req.url);
    const network = (url.searchParams.get("network") || "mainnet-beta") as NetworkType;

    // Validate address
    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(address);
    } catch {
      return error("Invalid Solana address", 400);
    }

    const connection = getConnection(network);

    // Get SOL balance
    const solBalance = await connection.getBalance(pubkey);
    const solAmount = solBalance / LAMPORTS_PER_SOL;

    // Get token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });

    // Map known mints
    const mintToAsset: Record<string, string> = {};
    for (const [asset, mint] of Object.entries(TOKEN_MINTS)) {
      if (asset !== "SOL") mintToAsset[mint] = asset;
    }

    // Get prices
    let prices: Record<string, number> = {};
    try {
      prices = await getPrices();
    } catch {
      // prices unavailable
    }

    const solPrice = prices.SOL || 0;

    const balances: Array<{
      asset: string;
      mint: string;
      balance: string;
      usdValue: number;
    }> = [];

    for (const account of tokenAccounts.value) {
      const parsed = account.account.data.parsed.info;
      const mint = parsed.mint as string;
      const asset = mintToAsset[mint];

      if (asset) {
        const balance = parsed.tokenAmount.uiAmountString;
        const price = prices[asset] || 0;
        balances.push({
          asset,
          mint,
          balance,
          usdValue: parseFloat(balance) * price,
        });
      }
    }

    const totalUsd = balances.reduce((sum, b) => sum + b.usdValue, 0);

    return success({
      walletAddress: address,
      network,
      balances,
      totalUsd,
      pendingSol: solAmount,
      pendingUsd: solAmount * solPrice,
      solPriceUsd: solPrice,
    });
  } catch (err) {
    return error(
      `Portfolio fetch failed: ${err instanceof Error ? err.message : "unknown"}`,
      500
    );
  }
}
