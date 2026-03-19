export const API_URL = "https://buff.finance";
export const AUTH_MESSAGE = "Buff API Authentication";

export const PLANS = {
  seed: { name: "Seed", roundToUsd: 0.5, buffFeePercent: 5 },
  sprout: { name: "Sprout", roundToUsd: 1, buffFeePercent: 3 },
  tree: { name: "Tree", roundToUsd: 5, buffFeePercent: 1.5 },
  forest: { name: "Forest", roundToUsd: 10, buffFeePercent: 1 },
} as const;

export const DEFAULT_SETTINGS = {
  enabled: true,
  plan: "sprout" as const,
  ceiling: 1.0,
  allocations: [{ asset: "BTC" as const, pct: 100 }],
  theme: "system" as const,
};

export const DEFAULT_STATS = {
  totalRoundUps: 0,
  totalRoundUpUsd: 0,
  totalTxIntercepted: 0,
  lastRoundUpAt: null,
};

// SystemProgram ID (11111111111111111111111111111111)
export const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";
