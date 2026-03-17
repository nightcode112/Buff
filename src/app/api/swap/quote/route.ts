import { success, error } from "@/lib/api-helpers";
import { requireAuth } from "@/lib/api-auth";

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
    const { inputLamports, targetAsset = "BTC", slippageBps = 100 } = body;

    if (!inputLamports) {
      return error("inputLamports is required", 400);
    }

    const outputMint = MAINNET_MINTS[targetAsset];
    if (!outputMint) {
      return error(`Unsupported asset: ${targetAsset}`, 400);
    }

    const params = new URLSearchParams({
      inputMint: MAINNET_MINTS.SOL,
      outputMint,
      amount: inputLamports.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: "false",
      asLegacyTransaction: "false",
    });

    const res = await fetch(
      `https://lite-api.jup.ag/swap/v1/quote?${params}`
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return error(`Jupiter quote failed: ${res.status} ${body}`, 502);
    }

    const data = await res.json();

    return success({
      inputLamports: parseInt(data.inAmount),
      inputSol: parseInt(data.inAmount) / 1e9,
      outputAmount: data.outAmount,
      outputMint: data.outputMint,
      targetAsset,
      priceImpact: data.priceImpactPct ?? "0",
      route:
        data.routePlan
          ?.map((r: { swapInfo: { label: string } }) => r.swapInfo.label)
          .join(" → ") ?? "direct",
    });
  } catch (err) {
    return error(
      `Invalid request: ${err instanceof Error ? err.message : "unknown"}`,
      400
    );
  }
}
