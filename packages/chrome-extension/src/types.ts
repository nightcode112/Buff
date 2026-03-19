// Shared types — mirrored from @buff-protocol/sdk

export type SupportedAsset = "BTC" | "ETH" | "SOL" | "USDC" | "USDT";
export type PlanName = "seed" | "sprout" | "tree" | "forest";

export interface Allocation {
  asset: SupportedAsset;
  pct: number;
}

export interface RoundUpBreakdown {
  txValueUsd: number;
  roundToUsd: number;
  roundedToUsd: number;
  roundUpUsd: number;
  buffFeePercent: number;
  buffFeeUsd: number;
  userInvestmentUsd: number;
  roundUpLamports: number;
  userInvestmentLamports: number;
  buffFeeLamports: number;
  solPriceUsd: number;
  skipped: boolean;
  capped: boolean;
}

export interface WrapResult {
  instructions: string[];
  breakdown: RoundUpBreakdown;
}

export interface Portfolio {
  walletAddress: string;
  network: string;
  balances: Array<{
    asset: string;
    mint: string;
    balance: string;
    usdValue: number;
  }>;
  pendingSol: number;
  pendingUsd: number;
  totalUsd: number;
}

export interface AccumulatorState {
  walletAddress: string;
  network: string;
  balanceSol: number;
  balanceUsd: number;
  solPriceUsd: number;
  thresholdUsd: number;
  thresholdReached: boolean;
  remaining: number;
}

export interface PlanInfo {
  name: string;
  roundToUsd: number;
  buffFeePercent: number;
}

// Extension-specific types

export interface BuffSettings {
  enabled: boolean;
  plan: PlanName;
  ceiling: number;
  allocations: Allocation[];
  theme: "light" | "dark" | "system";
}

export interface BuffAuth {
  walletPubkey: string;
  apiKey: string;
  buffWalletPubkey: string;
  signature: string;
}

export interface BuffStats {
  totalRoundUps: number;
  totalRoundUpUsd: number;
  totalTxIntercepted: number;
  lastRoundUpAt: number | null;
}

// Message types between inject ↔ content ↔ background
export const CHANNEL = "buff-extension" as const;

export type MessageType =
  | "BUFF_WRAP_REQUEST"
  | "BUFF_WRAP_RESPONSE"
  | "BUFF_GET_STATE"
  | "BUFF_STATE_RESPONSE"
  | "BUFF_GET_PRICE"
  | "BUFF_PRICE_RESPONSE"
  | "BUFF_API_REQUEST"
  | "BUFF_API_RESPONSE";

export interface BuffMessage {
  channel: typeof CHANNEL;
  type: MessageType;
  id: string;
  payload: unknown;
}

export interface WrapRequest {
  txValueUsd: number;
  userPubkey: string;
}

export interface WrapResponse {
  success: boolean;
  instructions?: SerializedInstruction[];
  breakdown?: RoundUpBreakdown;
  error?: string;
  skip?: boolean;
}

export interface SerializedInstruction {
  programId: string;
  keys: Array<{
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  data: string; // base64
}

export interface StateResponse {
  enabled: boolean;
  authenticated: boolean;
  plan: PlanName;
  ceiling: number;
  walletPubkey: string | null;
  buffWalletPubkey: string | null;
}
