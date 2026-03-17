import { success, error, getConnection } from "@/lib/api-helpers";
import { PublicKey } from "@solana/web3.js";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const address = url.searchParams.get("address");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    if (!address) {
      return error("address query param is required", 400);
    }

    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(address);
    } catch {
      return error("Invalid Solana address", 400);
    }

    const connection = getConnection("mainnet-beta");
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit: Math.min(limit, 50),
    });

    return success(signatures);
  } catch (err) {
    return error(
      `Activity fetch failed: ${err instanceof Error ? err.message : "unknown"}`,
      500
    );
  }
}
