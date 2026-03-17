import {
  success,
  error,
  calculateRoundUp,
  getBuffFeePercent,
  getPrices,
  PLANS,
} from "@/lib/api-helpers";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: Request) {
  const authError = requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { txValueUsd, plan, roundToUsd, ceiling = 1.0 } = body;

    if (txValueUsd === undefined || txValueUsd === null) {
      return error("txValueUsd is required", 400);
    }

    // Resolve round-up increment
    let roundTo: number;
    if (roundToUsd) {
      roundTo = roundToUsd;
    } else if (plan && PLANS[plan as keyof typeof PLANS]) {
      roundTo = PLANS[plan as keyof typeof PLANS].roundToUsd;
    } else {
      roundTo = PLANS.sprout.roundToUsd; // default
    }

    const result = calculateRoundUp(txValueUsd, roundTo, ceiling);
    const buffFeePercent = getBuffFeePercent(roundTo);
    const buffFeeUsd = result.roundUpUsd * (buffFeePercent / 100);
    const userInvestmentUsd = result.roundUpUsd - buffFeeUsd;

    // Get SOL price for conversion
    let solPriceUsd = 0;
    let roundUpSol = 0;
    let buffFeeSol = 0;
    let userInvestmentSol = 0;

    try {
      const prices = await getPrices();
      solPriceUsd = prices.SOL;
      if (solPriceUsd > 0) {
        roundUpSol = result.roundUpUsd / solPriceUsd;
        buffFeeSol = buffFeeUsd / solPriceUsd;
        userInvestmentSol = userInvestmentUsd / solPriceUsd;
      }
    } catch {
      // prices unavailable — return USD only
    }

    return success({
      txValueUsd,
      roundToUsd: roundTo,
      roundedToUsd: result.roundedToUsd,
      roundUpUsd: result.roundUpUsd,
      roundUpSol,
      buffFeePercent,
      buffFeeUsd,
      buffFeeSol,
      userInvestmentUsd,
      userInvestmentSol,
      solPriceUsd,
      skipped: result.skipped,
      capped: result.capped,
    });
  } catch (err) {
    return error(
      `Invalid request: ${err instanceof Error ? err.message : "unknown"}`,
      400
    );
  }
}
