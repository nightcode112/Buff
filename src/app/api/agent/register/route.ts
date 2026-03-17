import { success, error } from "@/lib/api-helpers";
import { PublicKey } from "@solana/web3.js";
import { randomUUID } from "crypto";

// POST /api/agent/register — register an agent wallet (API-key auth only, no wallet signature)
export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return error("x-api-key header is required", 401);
    }

    // Validate API key against env (simple check — expand as needed)
    const validKeys = (process.env.BUFF_API_KEYS ?? "").split(",").filter(Boolean);
    if (validKeys.length > 0 && !validKeys.includes(apiKey)) {
      return error("Invalid API key", 403);
    }

    const body = await req.json();
    const { publicKey, agentId, agentType } = body as {
      publicKey: string;
      agentId?: string;
      agentType?: "claude" | "gpt" | "custom";
    };

    if (!publicKey) {
      return error("publicKey is required", 400);
    }

    // Validate the public key is a valid Solana address
    try {
      new PublicKey(publicKey);
    } catch {
      return error("Invalid Solana public key", 400);
    }

    const validTypes = ["claude", "gpt", "custom"];
    if (agentType && !validTypes.includes(agentType)) {
      return error(`agentType must be one of: ${validTypes.join(", ")}`, 400);
    }

    const resolvedAgentId = agentId ?? `agent-${randomUUID()}`;

    return success({
      registered: true,
      publicKey,
      agentId: resolvedAgentId,
      agentType: agentType ?? "custom",
    });
  } catch (err) {
    return error(
      `Registration failed: ${err instanceof Error ? err.message : "unknown"}`,
      400
    );
  }
}
