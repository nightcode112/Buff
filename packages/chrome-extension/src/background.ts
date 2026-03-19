/**
 * Background Service Worker
 *
 * Handles all API communication. The API key never leaves this context.
 * Content script relays messages from inject.ts to here.
 *
 * FAIL-OPEN: If anything goes wrong, respond with { skip: true }
 * so the user's transaction goes through unmodified.
 */

import * as api from "./lib/api-client";
import * as storage from "./lib/storage";
import { getSolPrice } from "./lib/price-cache";
import { deserializeInstructions } from "./lib/instruction-deser";
import { SYSTEM_PROGRAM_ID, API_URL } from "./constants";
import type {
  WrapRequest,
  WrapResponse,
  StateResponse,
  BuffStats,
  SerializedInstruction,
} from "./types";

// ── Message Handler ──

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message?.type) return false;

  handleMessage(message)
    .then(sendResponse)
    .catch((err) => {
      console.error("[Buff BG] Error:", err);
      // Fail-open for wrap requests
      if (message.type === "BUFF_WRAP_REQUEST") {
        sendResponse({ success: false, skip: true, error: err.message });
      } else {
        sendResponse({ error: err.message });
      }
    });

  return true; // async response
});

async function handleMessage(message: { type: string; payload?: unknown }) {
  switch (message.type) {
    case "BUFF_WRAP_REQUEST":
      return handleWrap(message.payload as WrapRequest);

    case "BUFF_GET_STATE":
      return handleGetState();

    case "BUFF_GET_PRICE":
      return handleGetPrice();

    case "BUFF_SET_ENABLED": {
      const { enabled } = message.payload as { enabled: boolean };
      await storage.update("settings", { enabled });
      return { success: true, enabled };
    }

    case "BUFF_SET_PLAN": {
      const { plan } = message.payload as { plan: string };
      await storage.update("settings", { plan: plan as "seed" | "sprout" | "tree" | "forest" });
      return { success: true, plan };
    }

    case "BUFF_SET_CEILING": {
      const { ceiling } = message.payload as { ceiling: number };
      await storage.update("settings", { ceiling });
      return { success: true, ceiling };
    }

    case "BUFF_SAVE_AUTH": {
      const auth = message.payload as {
        walletPubkey: string;
        apiKey: string;
        buffWalletPubkey: string;
        signature: string;
      };
      await storage.set("auth", auth);
      return { success: true };
    }

    case "BUFF_DISCONNECT": {
      await storage.set("auth", null);
      return { success: true };
    }

    case "BUFF_GET_PORTFOLIO": {
      const auth = await storage.get("auth");
      if (!auth?.buffWalletPubkey) return { error: "Not authenticated" };
      const portfolio = await api.getPortfolio(auth.buffWalletPubkey);
      const accumulator = await api.getAccumulator(auth.buffWalletPubkey);
      return { portfolio, accumulator };
    }

    case "BUFF_GET_STATS": {
      return storage.get("stats");
    }

    case "BUFF_WALLET_CONNECT": {
      // Relay to active tab's content script → inject.ts → wallet
      return relayToActiveTab("BUFF_WALLET_CONNECT", {});
    }

    case "BUFF_WALLET_SIGN": {
      const { message: authMsg } = message.payload as { message: string };
      return relayToActiveTab("BUFF_WALLET_SIGN", { message: authMsg });
    }

    case "BUFF_API_REQUEST": {
      // Generic API proxy — used by popup for setup flows
      const { path, method, body, headers: extraHeaders } = message.payload as {
        path: string;
        method?: string;
        body?: unknown;
        headers?: Record<string, string>;
      };
      return handleApiRequest(path, method, body, extraHeaders);
    }

    default:
      return { error: "Unknown message type" };
  }
}

// ── Generic API Request (for popup setup) ──

async function handleApiRequest(
  path: string,
  method = "GET",
  body?: unknown,
  extraHeaders?: Record<string, string>
) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...extraHeaders,
    };

    // Add auth headers if we have them
    const auth = await storage.get("auth");
    if (auth?.apiKey) {
      headers["x-api-key"] = auth.apiKey;
      headers["x-wallet"] = auth.walletPubkey;
    }

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();
    if (!json.ok) {
      return { error: json.error || `API error: ${res.status}` };
    }
    return json.data;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "API request failed" };
  }
}

// ── Wrap Handler ──

async function handleWrap(req: WrapRequest): Promise<WrapResponse> {
  const settings = await storage.get("settings");
  const auth = await storage.get("auth");

  // Guard: disabled or not authenticated
  if (!settings.enabled) {
    return { success: false, skip: true };
  }
  if (!auth?.apiKey || !auth?.buffWalletPubkey) {
    return { success: false, skip: true, error: "Not authenticated" };
  }

  // Guard: tx value is 0 or negative
  if (!req.txValueUsd || req.txValueUsd <= 0) {
    return { success: false, skip: true };
  }

  try {
    const result = await api.wrap(req.txValueUsd, req.userPubkey);

    // If skipped (exact dollar amount)
    if (!result.instructions || result.instructions.length === 0) {
      return {
        success: true,
        skip: true,
        breakdown: result.breakdown,
      };
    }

    // Deserialize and validate instructions
    const instructions = deserializeInstructions(result.instructions);

    // Validate: all instructions must be SystemProgram transfers from the user
    for (const ix of instructions) {
      if (ix.programId !== SYSTEM_PROGRAM_ID) {
        console.warn("[Buff BG] Rejected non-SystemProgram instruction");
        return { success: false, skip: true, error: "Invalid instruction programId" };
      }
      const fromKey = ix.keys.find((k) => k.isSigner);
      if (fromKey && fromKey.pubkey !== req.userPubkey) {
        console.warn("[Buff BG] Rejected instruction: signer mismatch");
        return { success: false, skip: true, error: "Signer mismatch" };
      }
    }

    // Validate: total amount within ceiling
    if (result.breakdown.roundUpUsd > settings.ceiling) {
      console.warn("[Buff BG] Round-up exceeds ceiling, skipping");
      return { success: false, skip: true, error: "Exceeds ceiling" };
    }

    // Update stats
    const stats = await storage.get("stats");
    const updatedStats: BuffStats = {
      totalRoundUps: stats.totalRoundUps + 1,
      totalRoundUpUsd: stats.totalRoundUpUsd + result.breakdown.roundUpUsd,
      totalTxIntercepted: stats.totalTxIntercepted + 1,
      lastRoundUpAt: Date.now(),
    };
    await storage.set("stats", updatedStats);

    return {
      success: true,
      instructions,
      breakdown: result.breakdown,
    };
  } catch (err) {
    // FAIL-OPEN: let the transaction through
    console.error("[Buff BG] Wrap API error:", err);
    return {
      success: false,
      skip: true,
      error: err instanceof Error ? err.message : "API error",
    };
  }
}

// ── State Handler ──

async function handleGetState(): Promise<StateResponse> {
  const settings = await storage.get("settings");
  const auth = await storage.get("auth");

  return {
    enabled: settings.enabled,
    authenticated: !!auth?.apiKey,
    plan: settings.plan,
    ceiling: settings.ceiling,
    walletPubkey: auth?.walletPubkey ?? null,
    buffWalletPubkey: auth?.buffWalletPubkey ?? null,
  };
}

// ── Price Handler ──

async function handleGetPrice(): Promise<{ solPrice: number | null }> {
  const solPrice = await getSolPrice();
  return { solPrice };
}

// ── Relay to Active Tab ──
// Sends a message to the content script on the currently active tab,
// which forwards it to inject.ts in the page context.

async function relayToActiveTab(
  type: string,
  payload: unknown
): Promise<unknown> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];

  if (!tab?.id) {
    return { error: "No active tab found. Open a dApp first." };
  }

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tab.id!,
      { type, id: `relay-${Date.now()}`, payload },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve({
            error: chrome.runtime.lastError.message || "Failed to reach page",
          });
        } else {
          resolve(response);
        }
      }
    );
  });
}
