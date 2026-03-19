// ── Protocol Analytics (in-memory, resets on cold start) ──
//
// Tracks round-up events across all wrap endpoints.
// Persists for the lifetime of the serverless instance.
// For durable storage, swap this for a database later.

export interface RoundUpEvent {
  timestamp: number;
  userPubkey: string;
  txValueUsd: number;
  roundUpUsd: number;
  buffFeeUsd: number;
  source: "api" | "browser"; // /api/wrap vs /api/browse/wrap
}

interface AnalyticsStore {
  events: RoundUpEvent[];
  totalRoundUps: number;
  totalVolumeUsd: number;
  totalFeesUsd: number;
  uniqueWallets: Set<string>;
  startedAt: number;
}

const g = globalThis as unknown as { __buffAnalytics?: AnalyticsStore };

function getStore(): AnalyticsStore {
  if (!g.__buffAnalytics) {
    g.__buffAnalytics = {
      events: [],
      totalRoundUps: 0,
      totalVolumeUsd: 0,
      totalFeesUsd: 0,
      uniqueWallets: new Set(),
      startedAt: Date.now(),
    };
  }
  return g.__buffAnalytics;
}

/** Call this after a successful (non-skipped) wrap */
export function logRoundUp(event: RoundUpEvent) {
  const store = getStore();
  store.events.push(event);
  store.totalRoundUps++;
  store.totalVolumeUsd += event.roundUpUsd;
  store.totalFeesUsd += event.buffFeeUsd;
  store.uniqueWallets.add(event.userPubkey);

  // Keep only last 500 events in memory to prevent unbounded growth
  if (store.events.length > 500) {
    store.events = store.events.slice(-500);
  }
}

/** Get aggregate stats (admin only) */
export function getStats() {
  const store = getStore();
  const now = Date.now();
  const uptimeMs = now - store.startedAt;

  // Last 24h / 1h / 5min breakdowns
  const last5min = store.events.filter((e) => now - e.timestamp < 5 * 60_000);
  const last1h = store.events.filter((e) => now - e.timestamp < 60 * 60_000);
  const last24h = store.events.filter((e) => now - e.timestamp < 24 * 60 * 60_000);

  const summarize = (events: RoundUpEvent[]) => ({
    count: events.length,
    volumeUsd: round(events.reduce((s, e) => s + e.roundUpUsd, 0)),
    feesUsd: round(events.reduce((s, e) => s + e.buffFeeUsd, 0)),
    uniqueWallets: new Set(events.map((e) => e.userPubkey)).size,
    avgRoundUpUsd: events.length
      ? round(events.reduce((s, e) => s + e.roundUpUsd, 0) / events.length)
      : 0,
  });

  return {
    lifetime: {
      totalRoundUps: store.totalRoundUps,
      totalVolumeUsd: round(store.totalVolumeUsd),
      totalFeesUsd: round(store.totalFeesUsd),
      uniqueWallets: store.uniqueWallets.size,
      uptimeMinutes: Math.floor(uptimeMs / 60_000),
    },
    last5min: summarize(last5min),
    last1h: summarize(last1h),
    last24h: summarize(last24h),
    recentEvents: store.events.slice(-20).reverse().map((e) => ({
      ...e,
      ago: `${Math.floor((now - e.timestamp) / 1000)}s ago`,
    })),
  };
}

function round(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000;
}
