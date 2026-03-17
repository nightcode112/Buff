// Buff Protocol SDK — Thin API Client
// All core logic (fees, treasury, swaps) lives server-side at buff.finance
// This SDK is a typed HTTP client — no sensitive logic here.

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

export interface SwapQuote {
  inputSol: number;
  outputAmount: string;
  outputMint: string;
  priceImpact: string;
  route: string;
}

export interface SwapTransaction {
  asset: string;
  pct: number;
  inputLamports: number;
  transaction: string;
  quote: SwapQuote;
}

export interface SwapBuildResult {
  ready: boolean;
  balanceSol: number;
  balanceUsd: number;
  threshold: number;
  remaining?: number;
  transactions: SwapTransaction[];
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

export interface BuffConfig {
  apiUrl?: string;
  apiKey?: string;
  plan?: PlanName;
  investInto?: SupportedAsset;
  allocations?: Allocation[];
  investThreshold?: number;
  slippageBps?: number;
  network?: "mainnet-beta" | "devnet";
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export class Buff {
  private apiUrl: string;
  private headers: Record<string, string>;
  private plan: PlanName;
  private investInto: SupportedAsset;
  private allocations: Allocation[];
  private investThreshold: number;
  private slippageBps: number;
  private network: string;

  constructor(config: BuffConfig = {}) {
    this.apiUrl = (config.apiUrl || "https://buff.finance").replace(/\/$/, "");
    this.plan = config.plan || "sprout";
    this.investInto = config.investInto || "BTC";
    this.allocations = config.allocations || [
      { asset: this.investInto, pct: 100 },
    ];
    this.investThreshold = config.investThreshold || 5;
    this.slippageBps = config.slippageBps || 100;
    this.network = config.network || "mainnet-beta";
    this.headers = { "Content-Type": "application/json" };

    if (config.apiKey) {
      this.headers["x-api-key"] = config.apiKey;
    }
  }

  /** Authenticate with wallet signature */
  setWalletAuth(walletPubkey: string, signature: string) {
    this.headers["x-wallet"] = walletPubkey;
    this.headers["x-signature"] = signature;
  }

  /** Authenticate with API key */
  setApiKey(apiKey: string) {
    this.headers["x-api-key"] = apiKey;
  }

  /** Set plan tier */
  setPlan(plan: PlanName) {
    this.plan = plan;
  }

  /** Set investment target */
  setInvestAsset(asset: SupportedAsset) {
    this.investInto = asset;
    this.allocations = [{ asset, pct: 100 }];
  }

  /** Set multi-asset allocation */
  setAllocations(allocations: Allocation[]) {
    this.allocations = allocations;
  }

  /** Set investment threshold in USD */
  setThreshold(usd: number) {
    this.investThreshold = usd;
  }

  // ── API Methods ──

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${this.apiUrl}${path}`, {
      ...options,
      headers: { ...this.headers, ...(options.headers as Record<string, string> || {}) },
    });

    const json: ApiResponse<T> = await res.json();

    if (!json.ok) {
      throw new Error(json.error || `API error: ${res.status}`);
    }

    return json.data as T;
  }

  /** Get available plans and pricing */
  async getPlans(): Promise<Record<string, PlanInfo>> {
    return this.request("/api/plans");
  }

  /** Get current crypto prices */
  async getPrices(): Promise<Record<string, number>> {
    return this.request("/api/price");
  }

  /** Get auth message to sign */
  async getAuthMessage(): Promise<{ message: string }> {
    return this.request("/api/auth");
  }

  /** Derive Buff wallet public key from signature */
  async deriveWallet(signature: string): Promise<{ publicKey: string }> {
    return this.request("/api/wallet/derive", {
      method: "POST",
      body: JSON.stringify({ signature }),
    });
  }

  /** Calculate round-up (informational, no instructions) */
  async calculateRoundUp(
    txValueUsd: number,
    plan?: PlanName
  ): Promise<RoundUpBreakdown> {
    return this.request("/api/roundup", {
      method: "POST",
      body: JSON.stringify({
        txValueUsd,
        plan: plan || this.plan,
      }),
    });
  }

  /**
   * Get wrap instructions — server builds transfer instructions
   * with fees enforced server-side. Append these to your transaction.
   */
  async getWrapInstructions(
    txValueUsd: number,
    userPubkey: string,
    buffWalletPubkey: string
  ): Promise<WrapResult> {
    return this.request("/api/wrap", {
      method: "POST",
      body: JSON.stringify({
        txValueUsd,
        userPubkey,
        buffWalletPubkey,
        plan: this.plan,
      }),
    });
  }

  /** Get portfolio for a wallet address */
  async getPortfolio(address: string): Promise<Portfolio> {
    return this.request(
      `/api/portfolio/${address}?network=${this.network}`
    );
  }

  /** Get accumulator state (balance vs threshold) */
  async getAccumulator(
    address: string,
    threshold?: number
  ): Promise<AccumulatorState> {
    const t = threshold || this.investThreshold;
    return this.request(
      `/api/accumulator/${address}?network=${this.network}&threshold=${t}`
    );
  }

  /** Get Jupiter swap quote */
  async getSwapQuote(
    inputLamports: number,
    targetAsset?: SupportedAsset
  ): Promise<SwapQuote> {
    return this.request("/api/swap/quote", {
      method: "POST",
      body: JSON.stringify({
        inputLamports,
        targetAsset: targetAsset || this.investInto,
        slippageBps: this.slippageBps,
      }),
    });
  }

  /**
   * Build swap transaction(s) — server builds unsigned Jupiter txs.
   * Sign with your Buff wallet keypair, then call executeSwap().
   */
  async buildSwap(
    buffWalletPubkey: string,
    options?: {
      targetAsset?: SupportedAsset;
      allocations?: Allocation[];
      threshold?: number;
    }
  ): Promise<SwapBuildResult> {
    return this.request("/api/swap/build", {
      method: "POST",
      body: JSON.stringify({
        buffWalletPubkey,
        targetAsset: options?.targetAsset || this.investInto,
        allocations: options?.allocations || this.allocations,
        slippageBps: this.slippageBps,
        network: this.network,
        threshold: options?.threshold || this.investThreshold,
      }),
    });
  }

  /** Execute a signed transaction via the server */
  async executeSwap(
    signedTransaction: string,
    options?: { skipValidation?: boolean }
  ): Promise<{ txSignature: string; confirmed: boolean }> {
    return this.request("/api/swap/execute", {
      method: "POST",
      body: JSON.stringify({
        signedTransaction,
        network: this.network,
        skipValidation: options?.skipValidation,
      }),
    });
  }

  /** Register an agent */
  async registerAgent(
    publicKey: string,
    agentId?: string,
    agentType?: string
  ): Promise<{ registered: boolean }> {
    return this.request("/api/agent/register", {
      method: "POST",
      body: JSON.stringify({ publicKey, agentId, agentType }),
    });
  }
}

export default Buff;
