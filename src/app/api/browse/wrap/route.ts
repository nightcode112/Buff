/**
 * Internal wrap endpoint for the dApp browser.
 *
 * Same logic as /api/wrap but without external API auth.
 * This is a same-origin call from the browse page — the user is already
 * authenticated via wallet connect on buff.finance. We validate that the
 * request comes from our origin via the Referer/Origin header.
 */

import {
  success,
  error,
  calculateRoundUp,
  getBuffFeePercent,
  getPrices,
  PLANS,
} from "@/lib/api-helpers";
import { logRoundUp } from "@/lib/analytics";
import {
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from "@solana/web3.js";

const TREASURY = new PublicKey(
  process.env.BUFF_TREASURY_PUBKEY ||
    "4pWnqVxtSfrMo2XK6AarW3rDNoN7UfAMEyHF8Y9KZGHf"
);

function serializeInstruction(ix: TransactionInstruction): string {
  return Buffer.from(
    JSON.stringify({
      programId: ix.programId.toBase58(),
      keys: ix.keys.map((k) => ({
        pubkey: k.pubkey.toBase58(),
        isSigner: k.isSigner,
        isWritable: k.isWritable,
      })),
      data: Buffer.from(ix.data).toString("base64"),
    })
  ).toString("base64");
}

export async function POST(req: Request) {
  // Same-origin check: only allow calls from our own domain
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  const host = req.headers.get("host") || "";

  const isSameOrigin =
    origin.includes(host) ||
    referer.includes(host) ||
    origin.includes("localhost") ||
    origin.includes("buff.finance");

  if (!isSameOrigin) {
    return error("Forbidden — this endpoint is internal only", 403);
  }

  try {
    const body = await req.json();
    const {
      txValueUsd,
      userPubkey,
      buffWalletPubkey,
      plan,
      roundToUsd,
      ceiling = 1.0,
    } = body;

    if (txValueUsd === undefined || txValueUsd === null) {
      return error("txValueUsd is required", 400);
    }
    if (!userPubkey) {
      return error("userPubkey is required", 400);
    }
    if (!buffWalletPubkey) {
      return error("buffWalletPubkey is required", 400);
    }

    let userPk: PublicKey, buffWalletPk: PublicKey;
    try {
      userPk = new PublicKey(userPubkey);
      buffWalletPk = new PublicKey(buffWalletPubkey);
    } catch {
      return error("Invalid public key format", 400);
    }

    let roundTo: number;
    if (roundToUsd) {
      roundTo = roundToUsd;
    } else if (plan && PLANS[plan as keyof typeof PLANS]) {
      roundTo = PLANS[plan as keyof typeof PLANS].roundToUsd;
    } else {
      roundTo = PLANS.sprout.roundToUsd;
    }

    const result = calculateRoundUp(txValueUsd, roundTo, ceiling);

    if (result.skipped) {
      return success({
        instructions: [],
        breakdown: {
          txValueUsd,
          roundToUsd: roundTo,
          roundUpUsd: 0,
          buffFeeUsd: 0,
          userInvestmentUsd: 0,
          skipped: true,
          capped: false,
        },
      });
    }

    const buffFeePercent = getBuffFeePercent(roundTo);
    const buffFeeUsd = result.roundUpUsd * (buffFeePercent / 100);
    const userInvestmentUsd = result.roundUpUsd - buffFeeUsd;

    const prices = await getPrices();
    const solPrice = prices.SOL;
    if (!solPrice || solPrice <= 0) {
      return error("Could not fetch SOL price", 502);
    }

    const userInvestmentLamports = Math.round(
      (userInvestmentUsd / solPrice) * LAMPORTS_PER_SOL
    );
    const buffFeeLamports = Math.round(
      (buffFeeUsd / solPrice) * LAMPORTS_PER_SOL
    );

    const instructions: string[] = [];

    if (userInvestmentLamports > 0) {
      instructions.push(
        serializeInstruction(
          SystemProgram.transfer({
            fromPubkey: userPk,
            toPubkey: buffWalletPk,
            lamports: userInvestmentLamports,
          })
        )
      );
    }

    if (buffFeeLamports > 0) {
      instructions.push(
        serializeInstruction(
          SystemProgram.transfer({
            fromPubkey: userPk,
            toPubkey: TREASURY,
            lamports: buffFeeLamports,
          })
        )
      );
    }

    // Log for analytics
    logRoundUp({
      timestamp: Date.now(),
      userPubkey,
      txValueUsd,
      roundUpUsd: result.roundUpUsd,
      buffFeeUsd,
      source: "browser",
    });

    return success({
      instructions,
      breakdown: {
        txValueUsd,
        roundToUsd: roundTo,
        roundedToUsd: result.roundedToUsd,
        roundUpUsd: result.roundUpUsd,
        buffFeePercent,
        buffFeeUsd,
        userInvestmentUsd,
        roundUpLamports: userInvestmentLamports + buffFeeLamports,
        userInvestmentLamports,
        buffFeeLamports,
        solPriceUsd: solPrice,
        skipped: false,
        capped: result.capped,
      },
    });
  } catch (err) {
    return error(
      `Wrap failed: ${err instanceof Error ? err.message : "unknown"}`,
      500
    );
  }
}
