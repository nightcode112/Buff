import { success, error, getConnection, type NetworkType } from "@/lib/api-helpers";
import { requireAuth } from "@/lib/api-auth";
import { VersionedTransaction } from "@solana/web3.js";

export async function POST(req: Request) {
  const authError = requireAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { signedTransaction, network = "mainnet-beta" } = body;

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

    // Deserialize to validate
    let tx: VersionedTransaction;
    try {
      tx = VersionedTransaction.deserialize(txBytes);
    } catch {
      return error("Invalid transaction — could not deserialize", 400);
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
