import { API_URL } from "../constants";

let cachedPrice: number | null = null;
let cachedAt = 0;
const TTL = 120_000; // 120 seconds

export async function getSolPrice(): Promise<number | null> {
  const now = Date.now();
  if (cachedPrice !== null && now - cachedAt < TTL) {
    return cachedPrice;
  }

  try {
    const res = await fetch(`${API_URL}/api/price`);
    const json = await res.json();
    if (json.ok && json.data?.SOL) {
      cachedPrice = json.data.SOL;
      cachedAt = now;
      return cachedPrice;
    }
  } catch {
    // Return stale cache if available
    if (cachedPrice !== null) return cachedPrice;
  }

  return null;
}
