/**
 * Estimate the USD value of a Solana transaction from its instructions.
 *
 * Strategy: sum all SOL transfers (SystemProgram.transfer) in the transaction.
 * This is a best-effort estimate — for token swaps the actual USD value
 * is the input amount, which is typically a SOL transfer.
 */

const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const LAMPORTS_PER_SOL = 1_000_000_000;

// SystemProgram.transfer instruction layout:
// First 4 bytes: instruction index (2 = transfer, little-endian u32)
// Next 8 bytes: lamports (little-endian u64)
const TRANSFER_IX_INDEX = 2;

export function estimateTxValueSol(
  instructions: Array<{
    programId: string;
    data: Uint8Array;
  }>
): number {
  let totalLamports = 0;

  for (const ix of instructions) {
    if (ix.programId !== SYSTEM_PROGRAM) continue;
    if (ix.data.length < 12) continue;

    // Read instruction index (u32 LE)
    const ixIndex =
      ix.data[0] |
      (ix.data[1] << 8) |
      (ix.data[2] << 16) |
      (ix.data[3] << 24);

    if (ixIndex !== TRANSFER_IX_INDEX) continue;

    // Read lamports (u64 LE) — JS can handle up to 2^53 safely
    let lamports = 0;
    for (let i = 0; i < 8; i++) {
      lamports += ix.data[4 + i] * 2 ** (8 * i);
    }

    totalLamports += lamports;
  }

  return totalLamports / LAMPORTS_PER_SOL;
}

export function solToUsd(sol: number, solPrice: number): number {
  return sol * solPrice;
}
