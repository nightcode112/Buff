import { success, error, getPrices } from "@/lib/api-helpers";

export async function GET() {
  try {
    const prices = await getPrices();
    return success({ prices, timestamp: Date.now() });
  } catch (err) {
    return error(
      `Failed to fetch prices: ${err instanceof Error ? err.message : "unknown"}`,
      502
    );
  }
}
