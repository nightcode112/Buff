import {
  success,
  error,
  getConnection,
  type NetworkType,
} from "@/lib/api-helpers";
import { requireAuth } from "@/lib/api-auth";
import { VersionedTransaction, PublicKey } from "@solana/web3.js";

// Treasury — validate that fee transfers target this address
const TREASURY = new PublicKey(
  process.env.BUFF_TREASURY_PUBKEY ||
    "4pWnqVxtSfrMo2XK6AarW3rDNoN7UfAMEyHF8Y9KZGHf"
);

export async function POST(req: Request) {
  const authError = requireAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      signedTransaction,
      network = "mainnet-beta",
      skipValidation = false,
    } = body;

    if (!signedTransaction) {
      return error("signedTransaction is required (base64-encoded)", 400);
    }

    // Decode
    let txBytes: Uint8Array;
    try {
      txBytes = new Uint8Array(Buffer.from(signedTransaction, "base64"));
    } catch {
      return error("Invalid base64 encoding", 400);
    }

    // Deserialize
    let tx: VersionedTransaction;
    try {
      tx = VersionedTransaction.deserialize(txBytes);
    } catch {
      return error("Invalid transaction — could not deserialize", 400);
    }

    // Validate: for wrap transactions, ensure treasury is referenced
    // (skip for Jupiter swap txs which have different structure)
    if (!skipValidation) {
      const accountKeys = tx.message.staticAccountKeys.map((k) =>
        k.toBase58()
      );
      const treasuryAddr = TREASURY.toBase58();

      // Check if this is a wrap transaction (contains SystemProgram transfers)
      // by looking for treasury address in account keys
      const hasSystemProgram = accountKeys.includes(
        "11111111111111111111111111111111"
      );

      if (hasSystemProgram && !accountKeys.includes(treasuryAddr)) {
        // This is a SystemProgram transaction but treasury is missing
        // Could be a modified SDK stripping the fee instruction
        return error(
          "Transaction validation failed: missing required fee transfer",
          403
        );
      }
    }

    const connection = getConnection(network as NetworkType);

    // Simulate first
    const simulation = await connection.simulateTransaction(tx);
    if (simulation.value.err) {
      return error(
        `Simulation failed: ${JSON.stringify(simulation.value.err)}`,
        400
      );
    }

    // Send
    const txSignature = await connection.sendRawTransaction(txBytes, {
      skipPreflight: true,
      maxRetries: 3,
    });

    // Confirm
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      {
        signature: txSignature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "confirmed"
    );

    return success({
      txSignature,
      confirmed: true,
      network,
    });
  } catch (err) {
    return error(
      `Transaction failed: ${err instanceof Error ? err.message : "unknown"}`,
      500
    );
  }
}
