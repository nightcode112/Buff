import { success, PLANS } from "@/lib/api-helpers";

export async function GET() {
  return success({
    plans: PLANS,
    ceiling: 1.0,
    defaultPlan: "sprout",
    defaultAsset: "BTC",
    defaultThreshold: 5.0,
    supportedAssets: ["BTC", "ETH", "SOL", "USDC", "USDT"],
  });
}
