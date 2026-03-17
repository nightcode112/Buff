import { success, error, getPrices, calculateRoundUp } from "@/lib/api-helpers";
import { Connection, PublicKey } from "@solana/web3.js";

const PROTOCOLS: Record<string, { name: string; cat: string; icon: string; color: string; pid: string }> = {
  jupiter: { name: "Jupiter", cat: "DEX Aggregator", icon: "JUP", color: "#2BD67B", pid: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" },
  raydium: { name: "Raydium", cat: "AMM", icon: "RAY", color: "#5AC4BE", pid: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8" },
  meteora: { name: "Meteora", cat: "DLMM", icon: "MET", color: "#E84DFF", pid: "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo" },
  orca: { name: "Orca", cat: "Whirlpool", icon: "ORCA", color: "#FFD15C", pid: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc" },
  tensor: { name: "Tensor", cat: "NFT", icon: "TNSR", color: "#8B5CF6", pid: "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN" },
  marinade: { name: "Marinade", cat: "Staking", icon: "MNDE", color: "#4DA2FF", pid: "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD" },
  pumpfun: { name: "Pump.fun", cat: "Launchpad", icon: "PUMP", color: "#00FF88", pid: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P" },
  jito: { name: "Jito", cat: "MEV", icon: "JITO", color: "#9FE870", pid: "Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P3mntvJR" },
};

const RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const PLANS = [
  { n: "Seed", r: 0.05, f: 1.0 }, { n: "Sprout", r: 0.10, f: 0.75 },
  { n: "Tree", r: 0.50, f: 0.5 }, { n: "Forest", r: 1.00, f: 0.25 },
];

async function fetchTxs(programId: string, solPrice: number) {
  const conn = new Connection(RPC, "confirmed");

  // Get 30 sigs, filter successful, take 5
  const sigs = await conn.getSignaturesForAddress(new PublicKey(programId), { limit: 30 });
  const good = sigs.filter(s => !s.err).slice(0, 5);
  if (!good.length) return [];

  const txs = [];
  for (const s of good) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const tx = await conn.getParsedTransaction(s.signature, { maxSupportedTransactionVersion: 0 });
      if (!tx?.meta) continue;

      const fee = tx.meta.fee;
      const pre = tx.meta.preBalances, post = tx.meta.postBalances;

      // Largest SOL movement
      let maxDiff = 0;
      for (let i = 0; i < pre.length; i++) {
        const d = Math.abs(pre[i] - post[i]);
        maxDiff = Math.max(maxDiff, i === 0 ? Math.max(0, d - fee) : d);
      }

      // Check stablecoins
      let stable = 0;
      for (const pt of (tx.meta.postTokenBalances || [])) {
        const pr = (tx.meta.preTokenBalances || []).find(p => p.accountIndex === pt.accountIndex && p.mint === pt.mint);
        if (pr?.uiTokenAmount?.uiAmount != null && pt.uiTokenAmount?.uiAmount != null) {
          const d = Math.abs(pt.uiTokenAmount.uiAmount - pr.uiTokenAmount.uiAmount);
          if (pt.mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" || pt.mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB")
            stable = Math.max(stable, d);
        }
      }

      const val = Math.max(stable, (maxDiff / 1e9) * solPrice);
      if (val < 0.01) continue;

      const v = Math.round(val * 100) / 100;
      txs.push({
        sig: s.signature, time: s.blockTime, value: v,
        fee: Math.round((fee / 1e9) * 1e8) / 1e8,
        feeUsd: Math.round((fee / 1e9) * solPrice * 10000) / 10000,
        ru: PLANS.map(p => {
          const { roundUpUsd, skipped } = calculateRoundUp(v, p.r);
          return { p: p.n, ru: roundUpUsd, inv: roundUpUsd - roundUpUsd * (p.f / 100), sk: skipped };
        }),
      });
    } catch { continue; }
  }
  return txs;
}

export async function GET(req: Request) {
  const pk = new URL(req.url).searchParams.get("protocol");
  try {
    const prices = await getPrices();
    const sol = prices.SOL || 0;

    if (pk && PROTOCOLS[pk]) {
      const p = PROTOCOLS[pk];
      const txs = await fetchTxs(p.pid, sol);
      return success({ p: { ...p, key: pk }, txs, sol });
    }
    return success({ protocols: Object.entries(PROTOCOLS).map(([k, p]) => ({ key: k, ...p })), sol });
  } catch (err) {
    return error(`${err instanceof Error ? err.message : "?"}`, 500);
  }
}

export const maxDuration = 30;
