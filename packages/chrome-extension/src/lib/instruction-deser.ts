/**
 * Deserialize instructions returned by the Buff /api/wrap endpoint.
 *
 * The server serializes each instruction as:
 *   base64( JSON.stringify({ programId, keys, data }) )
 *
 * Where:
 *   - programId: base58 string
 *   - keys: Array<{ pubkey: string, isSigner: boolean, isWritable: boolean }>
 *   - data: base64-encoded instruction data
 */

import type { SerializedInstruction } from "../types";

export function deserializeInstruction(
  encoded: string
): SerializedInstruction {
  const json = atob(encoded);
  const parsed = JSON.parse(json);

  return {
    programId: parsed.programId,
    keys: parsed.keys.map((k: { pubkey: string; isSigner: boolean; isWritable: boolean }) => ({
      pubkey: k.pubkey,
      isSigner: k.isSigner,
      isWritable: k.isWritable,
    })),
    data: parsed.data,
  };
}

export function deserializeInstructions(
  encodedList: string[]
): SerializedInstruction[] {
  return encodedList.map(deserializeInstruction);
}
