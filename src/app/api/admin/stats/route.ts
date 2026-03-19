import { success, error } from "@/lib/api-helpers";
import { getStats } from "@/lib/analytics";

/**
 * GET /api/admin/stats
 *
 * Admin-only endpoint — requires the BUFF_API_KEY.
 * Returns protocol usage analytics: round-up counts, volume, fees,
 * unique wallets, and recent events.
 *
 * Usage:
 *   curl https://buff.finance/api/admin/stats -H "x-api-key: YOUR_ADMIN_KEY"
 */
export async function GET(req: Request) {
  const providedKey = req.headers.get("x-api-key");
  const adminKey = process.env.BUFF_API_KEY?.trim();

  if (!adminKey || !providedKey || providedKey !== adminKey) {
    return error("Unauthorized", 401);
  }

  return success(getStats());
}
