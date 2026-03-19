import { API_URL } from "../constants";
import type {
  WrapResult,
  Portfolio,
  AccumulatorState,
  PlanName,
} from "../types";
import * as storage from "./storage";

async function getHeaders(): Promise<Record<string, string>> {
  const auth = await storage.get("auth");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth?.apiKey) {
    headers["x-api-key"] = auth.apiKey;
    headers["x-wallet"] = auth.walletPubkey;
  }

  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  });

  const json = await res.json();
  if (!json.ok) {
    throw new Error(json.error || `API error: ${res.status}`);
  }
  return json.data as T;
}

export async function wrap(
  txValueUsd: number,
  userPubkey: string
): Promise<WrapResult> {
  const auth = await storage.get("auth");
  const settings = await storage.get("settings");

  if (!auth?.buffWalletPubkey) {
    throw new Error("Not authenticated");
  }

  return request("/api/wrap", {
    method: "POST",
    body: JSON.stringify({
      txValueUsd,
      userPubkey,
      buffWalletPubkey: auth.buffWalletPubkey,
      plan: settings.plan,
      ceiling: settings.ceiling,
    }),
  });
}

export async function getPortfolio(address: string): Promise<Portfolio> {
  return request(`/api/portfolio/${address}?network=mainnet-beta`);
}

export async function getAccumulator(
  address: string,
  threshold = 5
): Promise<AccumulatorState> {
  return request(
    `/api/accumulator/${address}?network=mainnet-beta&threshold=${threshold}`
  );
}

export async function generateApiKey(
  wallet: string,
  signature: string
): Promise<{ apiKey: string }> {
  return request("/api/keys/generate", {
    method: "POST",
    body: JSON.stringify({ wallet, signature }),
  });
}

export async function deriveWallet(
  signature: string
): Promise<{ publicKey: string }> {
  return request("/api/wallet/derive", {
    method: "POST",
    body: JSON.stringify({ signature }),
  });
}

export async function getAuthMessage(): Promise<{ message: string }> {
  return request("/api/auth");
}

export async function getPlans(): Promise<Record<string, { name: string; roundToUsd: number; buffFeePercent: number }>> {
  return request("/api/plans");
}

export async function getPrice(): Promise<Record<string, number>> {
  return request("/api/price");
}
