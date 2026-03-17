import { success, error, getPrices, calculateRoundUp } from "@/lib/api-helpers";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const JUPITER_API = "https://lite-api.jup.ag/swap/v1";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inputAmountUsd = 100, inputToken = "SOL", outputToken = "USDC" } = body;

    const prices = await getPrices();
    const solPrice = prices.SOL || 0;

    // Convert USD to lamports/token amount for Jupiter quote
    const MINTS: Record<string, string> = {
      SOL: SOL_MINT,
      USDC: USDC_MINT,
      BTC: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
      ETH: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    };

    const inputMint = MINTS[inputToken] || SOL_MINT;
    const outputMint = MINTS[outputToken] || USDC_MINT;

    // Calculate input amount in smallest unit
    let inputAmount: number;
    if (inputToken === "SOL") {
      inputAmount = Math.floor((inputAmountUsd / solPrice) * 1e9);
    } else if (inputToken === "USDC" || inputToken === "USDT") {
      inputAmount = Math.floor(inputAmountUsd * 1e6);
    } else {
      const tokenPrice = prices[inputToken] || 1;
      inputAmount = Math.floor((inputAmountUsd / tokenPrice) * 1e9);
    }

    // Get real Jupiter quote
    let jupiterQuote = null;
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: inputAmount.toString(),
        slippageBps: "100",
      });
      const quoteRes = await fetch(`${JUPITER_API}/quote?${params}`);
      if (quoteRes.ok) {
        jupiterQuote = await quoteRes.json();
      }
    } catch {
      // Jupiter unavailable
    }

    // Calculate round-ups for all plans
    const plans = [
      { name: "Seed", roundTo: 0.05, fee: 1.0 },
      { name: "Sprout", roundTo: 0.10, fee: 0.75 },
      { name: "Tree", roundTo: 0.50, fee: 0.5 },
      { name: "Forest", roundTo: 1.00, fee: 0.25 },
    ];

    const roundUps = plans.map((plan) => {
      const { roundUpUsd, roundedToUsd, skipped, capped } = calculateRoundUp(
        inputAmountUsd,
        plan.roundTo
      );
      const buffFee = roundUpUsd * (plan.fee / 100);
      return {
        plan: plan.name,
        roundTo: plan.roundTo,
        roundUpUsd,
        roundedToUsd,
        investedUsd: roundUpUsd - buffFee,
        buffFeeUsd: buffFee,
        buffFeePercent: plan.fee,
        skipped,
        capped,
        // Monthly projection (assuming 20 txs/day)
        monthlyInvested: (roundUpUsd - buffFee) * 20 * 30,
        yearlyInvested: (roundUpUsd - buffFee) * 20 * 365,
      };
    });

    // Estimated gas
    const estimatedGasSol = 0.000005 + 0.0001; // base + avg priority
    const estimatedGasUsd = estimatedGasSol * solPrice;

    return success({
      input: {
        amountUsd: inputAmountUsd,
        token: inputToken,
        mint: inputMint,
      },
      output: {
        token: outputToken,
        mint: outputMint,
        amount: jupiterQuote?.outAmount || null,
        priceImpact: jupiterQuote?.priceImpactPct || null,
        route: jupiterQuote?.routePlan
          ?.map((r: { swapInfo: { label: string } }) => r.swapInfo.label)
          .join(" → ") || null,
      },
      gas: {
        estimatedSol: estimatedGasSol,
        estimatedUsd: estimatedGasUsd,
      },
      roundUps,
      solPriceUsd: solPrice,
      prices,
      timestamp: Date.now(),
    });
  } catch (err) {
    return error(`Quote failed: ${err instanceof Error ? err.message : "unknown"}`, 500);
  }
}
