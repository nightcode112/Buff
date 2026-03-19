import "./popup.css";
import type {
  PlanName,
  StateResponse,
  BuffStats,
  Portfolio,
  AccumulatorState,
  Allocation,
  SupportedAsset,
} from "../types";
import { PLANS } from "../constants";

// ── State ──

let state: StateResponse | null = null;
let stats: BuffStats | null = null;
let portfolio: Portfolio | null = null;
let accumulator: AccumulatorState | null = null;
let activeTab = "home";
let setupStep: "connect" | "signing" | "done" = "connect";
let allocations: Allocation[] = [{ asset: "BTC" as SupportedAsset, pct: 100 }];

const ASSET_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#9945FF",
  USDC: "#2775CA",
  USDT: "#26A17B",
};

// ── Messaging ──

function sendMessage(type: string, payload: unknown = {}): Promise<unknown> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, payload }, resolve);
  });
}

// ── Init ──

async function init() {
  state = (await sendMessage("BUFF_GET_STATE")) as StateResponse;
  stats = (await sendMessage("BUFF_GET_STATS")) as BuffStats;

  // Load saved allocations
  const stored = await chrome.storage.local.get("popup_allocations");
  if (stored.popup_allocations) {
    allocations = stored.popup_allocations;
  }

  if (state?.authenticated) {
    // Fetch portfolio in background
    fetchPortfolio();
  }

  render();
}

async function fetchPortfolio() {
  try {
    const result = (await sendMessage("BUFF_GET_PORTFOLIO")) as {
      portfolio?: Portfolio;
      accumulator?: AccumulatorState;
      error?: string;
    };
    if (result.portfolio) portfolio = result.portfolio;
    if (result.accumulator) accumulator = result.accumulator;
    render();
  } catch {}
}

// ── Render ──

function render() {
  const app = document.getElementById("app")!;

  if (!state?.authenticated) {
    app.innerHTML = renderSetup();
    bindSetupEvents();
    return;
  }

  app.innerHTML = `
    ${renderHeader()}
    ${renderTabs()}
    <div class="panel ${activeTab === "home" ? "active" : ""}" id="panel-home">
      ${renderHome()}
    </div>
    <div class="panel ${activeTab === "plan" ? "active" : ""}" id="panel-plan">
      ${renderPlan()}
    </div>
    <div class="panel ${activeTab === "alloc" ? "active" : ""}" id="panel-alloc">
      ${renderAllocation()}
    </div>
    <div class="panel ${activeTab === "portfolio" ? "active" : ""}" id="panel-portfolio">
      ${renderPortfolio()}
    </div>
    <div class="panel ${activeTab === "settings" ? "active" : ""}" id="panel-settings">
      ${renderSettings()}
    </div>
    <div class="footer">
      Powered by <a href="https://buff.finance" target="_blank">buff.finance</a>
    </div>
  `;

  bindEvents();
}

// ── Setup Screen ──

function renderSetup(): string {
  return `
    <div class="setup">
      <div class="setup-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
          <path d="M12 2v20M2 12h20"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </div>
      <h2>Welcome to Buff</h2>
      <p>Auto round-up every Solana transaction and invest the spare change into BTC, ETH, and more.</p>

      <div class="setup-steps">
        <div class="setup-step ${setupStep !== "connect" ? "step-done" : ""}">
          <span class="step-num">1</span>
          <span>Connect your Phantom wallet</span>
        </div>
        <div class="setup-step ${setupStep === "done" ? "step-done" : ""}">
          <span class="step-num">2</span>
          <span>Sign to generate API key & Buff wallet</span>
        </div>
        <div class="setup-step">
          <span class="step-num">3</span>
          <span>Start investing automatically</span>
        </div>
      </div>

      ${errorMessage ? `<div class="error-box">${errorMessage}</div>` : ""}

      <button class="btn btn-primary" id="btn-connect" ${setupStep === "signing" ? "disabled" : ""}>
        ${setupStep === "signing" ? '<span class="spinner" style="width:16px;height:16px;margin:0;border-width:2px"></span> Signing...' : "Connect Wallet"}
      </button>

      ${setupStep === "connect" ? `
        <p style="margin-top: 16px; font-size: 10px; color: var(--muted-fg);">
          Requires Phantom, Solflare, or Backpack. Open a dApp tab first, then click Connect.
        </p>
      ` : ""}
    </div>
  `;
}

function bindSetupEvents() {
  const btn = document.getElementById("btn-connect");
  btn?.addEventListener("click", handleConnect);
}

async function handleConnect() {
  try {
    setupStep = "signing";
    render();

    // Step 1: Connect wallet via active tab
    // popup → background → content script → inject.ts → window.solana.connect()
    const connectResult = (await sendMessage("BUFF_WALLET_CONNECT")) as {
      pubkey?: string;
      error?: string;
    };

    if (connectResult?.error || !connectResult?.pubkey) {
      showError(connectResult?.error || "No Solana wallet found. Open a dApp and try again.");
      setupStep = "connect";
      render();
      return;
    }

    const walletPubkey = connectResult.pubkey;

    // Step 2: Sign auth message via active tab
    // popup → background → content script → inject.ts → window.solana.signMessage()
    const signResult = (await sendMessage("BUFF_WALLET_SIGN", {
      message: "Buff API Authentication",
    })) as { signature?: string; error?: string };

    if (signResult?.error || !signResult?.signature) {
      showError(signResult?.error || "Signing was cancelled or failed.");
      setupStep = "connect";
      render();
      return;
    }

    const signature = signResult.signature;

    // Step 3: Generate API key via background → Buff API
    const keyResult = (await sendMessage("BUFF_API_REQUEST", {
      path: "/api/keys/generate",
      method: "POST",
      body: { wallet: walletPubkey, signature },
    })) as { apiKey?: string; error?: string };

    const apiKey = keyResult?.apiKey || "";

    // Step 4: Derive Buff wallet via background → Buff API
    const walletResult = (await sendMessage("BUFF_API_REQUEST", {
      path: "/api/wallet/derive",
      method: "POST",
      body: { signature },
      headers: {
        "x-wallet": walletPubkey,
        "x-signature": signature,
      },
    })) as { publicKey?: string; error?: string };

    const buffWalletPubkey = walletResult?.publicKey || "";

    // Step 5: Save auth credentials in extension storage
    await sendMessage("BUFF_SAVE_AUTH", {
      walletPubkey,
      apiKey: apiKey || `sig:${signature}`,
      buffWalletPubkey,
      signature,
    });

    setupStep = "done";
    state = (await sendMessage("BUFF_GET_STATE")) as StateResponse;
    render();
  } catch (err) {
    console.error("[Buff Popup] Connect error:", err);
    showError(err instanceof Error ? err.message : "Connection failed. Make sure a dApp is open.");
    setupStep = "connect";
    render();
  }
}

let errorMessage: string | null = null;

function showError(msg: string) {
  errorMessage = msg;
  // Auto-clear after 5 seconds
  setTimeout(() => {
    errorMessage = null;
    render();
  }, 5000);
}

// ── Header ──

function renderHeader(): string {
  const enabled = state?.enabled ?? false;
  return `
    <div class="header">
      <div class="header-row">
        <div class="brand">
          <span class="brand-name">Buff</span>
          <span class="brand-badge">${state?.plan || "sprout"}</span>
        </div>
        <label class="toggle">
          <input type="checkbox" id="toggle-enabled" ${enabled ? "checked" : ""}>
          <span class="toggle-track"></span>
          <span class="toggle-thumb"></span>
        </label>
      </div>
      <div style="margin-top: 10px; font-size: 11px; opacity: 0.8;">
        <span class="dot ${enabled ? "dot-green" : "dot-gray"}" style="margin-right: 4px;"></span>
        ${enabled ? "Active — rounding up transactions" : "Paused"}
      </div>
    </div>
  `;
}

// ── Tabs ──

function renderTabs(): string {
  const tabs = [
    { id: "home", label: "Home" },
    { id: "plan", label: "Plan" },
    { id: "alloc", label: "Allocate" },
    { id: "portfolio", label: "Portfolio" },
    { id: "settings", label: "Settings" },
  ];

  return `
    <div class="tabs">
      ${tabs
        .map(
          (t) =>
            `<button class="tab ${activeTab === t.id ? "active" : ""}" data-tab="${t.id}">${t.label}</button>`
        )
        .join("")}
    </div>
  `;
}

// ── Home Panel ──

function renderHome(): string {
  const roundUps = stats?.totalRoundUps ?? 0;
  const totalUsd = stats?.totalRoundUpUsd ?? 0;
  const txCount = stats?.totalTxIntercepted ?? 0;
  const lastAt = stats?.lastRoundUpAt;

  return `
    <div class="card">
      <div class="card-label">Total Round-Ups Invested</div>
      <div class="card-value">$${totalUsd.toFixed(2)}</div>
      <div class="card-sub">${roundUps} round-ups across ${txCount} transactions</div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">${roundUps}</div>
        <div class="stat-label">Round-Ups</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${lastAt ? timeAgo(lastAt) : "Never"}</div>
        <div class="stat-label">Last Round-Up</div>
      </div>
    </div>

    ${accumulator ? `
      <div class="card" style="margin-top: 12px;">
        <div class="card-label">Accumulator</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 16px; font-weight: 700;">${accumulator.balanceSol.toFixed(6)} SOL</span>
          <span style="font-size: 12px; color: var(--muted-fg);">$${accumulator.balanceUsd.toFixed(2)}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${Math.min((accumulator.balanceUsd / accumulator.thresholdUsd) * 100, 100)}%"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--muted-fg);">
          <span>$0</span>
          <span>Threshold: $${accumulator.thresholdUsd}</span>
        </div>
      </div>
    ` : ""}

    <div style="margin-top: 12px; text-align: center;">
      <span class="badge ${state?.enabled ? "badge-active" : "badge-inactive"}">
        <span class="dot ${state?.enabled ? "dot-green" : "dot-gray"}"></span>
        ${state?.enabled ? "Extension Active" : "Extension Paused"}
      </span>
    </div>
  `;
}

// ── Plan Panel ──

function renderPlan(): string {
  const currentPlan = state?.plan || "sprout";
  const planEntries = Object.entries(PLANS) as [PlanName, typeof PLANS[PlanName]][];

  return `
    <div class="card-label" style="padding: 0 0 12px;">Choose Your Plan</div>
    <div class="plan-grid">
      ${planEntries
        .map(
          ([key, info]) => `
        <div class="plan-card ${currentPlan === key ? "selected" : ""}" data-plan="${key}">
          <div class="plan-name">${info.name}</div>
          <div class="plan-amount">$${info.roundToUsd}</div>
          <div class="plan-fee">${info.buffFeePercent}% fee</div>
        </div>
      `
        )
        .join("")}
    </div>
    <div class="card" style="margin-top: 16px;">
      <div style="font-size: 11px; color: var(--muted-fg); line-height: 1.7;">
        <strong>How it works:</strong> Each transaction is rounded up to the next $${PLANS[currentPlan].roundToUsd} increment.
        The spare change is invested into your chosen assets.
        <br><br>
        Example: A $7.30 swap becomes $${(Math.ceil(7.3 / PLANS[currentPlan].roundToUsd) * PLANS[currentPlan].roundToUsd).toFixed(2)} — you invest $${((Math.ceil(7.3 / PLANS[currentPlan].roundToUsd) * PLANS[currentPlan].roundToUsd) - 7.3).toFixed(2)} in spare change.
      </div>
    </div>
  `;
}

// ── Allocation Panel ──

function renderAllocation(): string {
  const total = allocations.reduce((s, a) => s + a.pct, 0);
  const isValid = total === 100;

  return `
    <div class="card-label" style="padding: 0 0 8px;">Investment Allocation</div>
    <div class="card">
      <div class="alloc-bar">
        ${allocations
          .map(
            (a) =>
              `<div class="alloc-segment" style="width:${total > 0 ? (a.pct / total) * 100 : 0}%; background:${ASSET_COLORS[a.asset] || "#666"};"></div>`
          )
          .join("")}
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="font-size: 10px; color: var(--muted-fg);">Total</span>
        <span style="font-size: 12px; font-weight: 700; color: ${isValid ? "var(--sage)" : "var(--red)"};">
          ${total}% ${isValid ? "Valid" : total < 100 ? `(${100 - total}% remaining)` : `(${total - 100}% over)`}
        </span>
      </div>

      ${allocations
        .map(
          (a, i) => `
        <div class="alloc-row">
          <div class="alloc-dot" style="background:${ASSET_COLORS[a.asset] || "#666"}"></div>
          <span class="alloc-name">${a.asset}</span>
          <input type="text" inputmode="numeric" class="alloc-input" data-alloc-idx="${i}" value="${a.pct}">
          <span style="font-size: 11px; color: var(--muted-fg);">%</span>
          <button class="btn-remove-alloc" data-alloc-idx="${i}" style="background:none;border:none;cursor:pointer;color:var(--muted-fg);font-size:16px;padding:4px;">&times;</button>
        </div>
      `
        )
        .join("")}
    </div>

    ${getAvailableAssets().length > 0 ? `
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${getAvailableAssets()
          .map(
            (a) =>
              `<button class="btn-add-alloc btn btn-outline" style="width:auto;padding:6px 12px;font-size:11px;" data-asset="${a}">+ ${a}</button>`
          )
          .join("")}
      </div>
    ` : ""}
  `;
}

function getAvailableAssets(): string[] {
  const used = new Set<string>(allocations.map((a) => a.asset));
  return ["BTC", "ETH", "SOL", "USDC", "USDT"].filter((a) => !used.has(a));
}

// ── Portfolio Panel ──

function renderPortfolio(): string {
  if (!portfolio) {
    return `
      <div class="loading">
        <div class="spinner"></div>
        Loading portfolio...
      </div>
    `;
  }

  const totalValue = (portfolio.totalUsd ?? 0) + (portfolio.pendingUsd ?? 0);
  const progressPct = accumulator
    ? Math.min((accumulator.balanceUsd / accumulator.thresholdUsd) * 100, 100)
    : 0;

  return `
    <div class="card">
      <div class="card-label">Total Portfolio Value</div>
      <div class="card-value">$${totalValue.toFixed(2)}</div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">$${(portfolio.totalUsd ?? 0).toFixed(2)}</div>
        <div class="stat-label">Invested</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${(portfolio.pendingSol ?? 0).toFixed(4)} SOL</div>
        <div class="stat-label">Pending</div>
      </div>
    </div>

    ${accumulator ? `
      <div class="card" style="margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--muted-fg);">
          <span>Threshold progress</span>
          <span>${progressPct.toFixed(0)}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progressPct}%"></div>
        </div>
        ${accumulator.thresholdReached ? `
          <button class="btn btn-primary" id="btn-invest" style="margin-top: 10px;">
            Invest Now
          </button>
        ` : `
          <div style="font-size: 10px; color: var(--muted-fg); text-align: center; margin-top: 6px;">
            $${accumulator.remaining.toFixed(2)} more to reach $${accumulator.thresholdUsd} threshold
          </div>
        `}
      </div>
    ` : ""}

    ${portfolio.balances.length > 0 ? `
      <div class="card" style="margin-top: 12px;">
        <div class="card-label">Holdings</div>
        ${portfolio.balances
          .map(
            (b) => `
          <div class="alloc-row">
            <div class="alloc-dot" style="background:${ASSET_COLORS[b.asset] || "#666"}"></div>
            <div style="flex:1;">
              <div style="font-weight: 600;">${b.asset}</div>
              <div style="font-size: 10px; color: var(--muted-fg); font-family: monospace;">${b.balance}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 600;">$${b.usdValue.toFixed(2)}</div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    ` : ""}
  `;
}

// ── Settings Panel ──

function renderSettings(): string {
  return `
    <div class="card">
      <div class="card-label">General</div>
      <div class="setting-row">
        <div>
          <div class="setting-label">Ceiling (USD)</div>
          <div class="setting-desc">Max round-up per transaction</div>
        </div>
        <input type="text" inputmode="decimal" class="setting-input" id="input-ceiling" value="${state?.ceiling ?? 1}">
      </div>
    </div>

    <div class="card">
      <div class="card-label">Account</div>
      <div class="setting-row">
        <div>
          <div class="setting-label">Main Wallet</div>
          <div class="setting-desc mono">${state?.walletPubkey ? truncate(state.walletPubkey) : "—"}</div>
        </div>
      </div>
      <div class="setting-row">
        <div>
          <div class="setting-label">Buff Wallet</div>
          <div class="setting-desc mono">${state?.buffWalletPubkey ? truncate(state.buffWalletPubkey) : "—"}</div>
        </div>
      </div>
    </div>

    <button class="btn btn-danger" id="btn-disconnect" style="margin-top: 8px;">
      Disconnect Wallet
    </button>
  `;
}

// ── Event Bindings ──

function bindEvents() {
  // Toggle
  document.getElementById("toggle-enabled")?.addEventListener("change", async (e) => {
    const enabled = (e.target as HTMLInputElement).checked;
    await sendMessage("BUFF_SET_ENABLED", { enabled });
    state = (await sendMessage("BUFF_GET_STATE")) as StateResponse;
    render();
  });

  // Tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeTab = (tab as HTMLElement).dataset.tab || "home";
      render();
    });
  });

  // Plan selection
  document.querySelectorAll(".plan-card").forEach((card) => {
    card.addEventListener("click", async () => {
      const plan = (card as HTMLElement).dataset.plan;
      if (plan) {
        await sendMessage("BUFF_SET_PLAN", { plan });
        state = (await sendMessage("BUFF_GET_STATE")) as StateResponse;
        render();
      }
    });
  });

  // Allocation inputs
  document.querySelectorAll(".alloc-input").forEach((input) => {
    input.addEventListener("blur", (e) => {
      const idx = parseInt((e.target as HTMLElement).dataset.allocIdx || "0");
      const val = parseInt((e.target as HTMLInputElement).value) || 0;
      allocations[idx].pct = Math.max(0, Math.min(100, val));
      saveAllocations();
      render();
    });
  });

  // Remove allocation
  document.querySelectorAll(".btn-remove-alloc").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt((e.target as HTMLElement).dataset.allocIdx || "0");
      allocations.splice(idx, 1);
      if (allocations.length === 0) {
        allocations = [{ asset: "BTC" as SupportedAsset, pct: 100 }];
      }
      saveAllocations();
      render();
    });
  });

  // Add allocation
  document.querySelectorAll(".btn-add-alloc").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const asset = (e.target as HTMLElement).closest("[data-asset]")?.getAttribute("data-asset") || (e.target as HTMLElement).dataset.asset;
      if (asset) {
        allocations.push({ asset: asset as SupportedAsset, pct: 0 });
        saveAllocations();
        render();
      }
    });
  });

  // Ceiling input
  document.getElementById("input-ceiling")?.addEventListener("blur", async (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value) || 1;
    await sendMessage("BUFF_SET_CEILING", { ceiling: Math.max(0.01, val) });
    state = (await sendMessage("BUFF_GET_STATE")) as StateResponse;
  });

  // Disconnect
  document.getElementById("btn-disconnect")?.addEventListener("click", async () => {
    if (confirm("Disconnect wallet? Your Buff wallet and round-up history are preserved.")) {
      await sendMessage("BUFF_DISCONNECT");
      state = (await sendMessage("BUFF_GET_STATE")) as StateResponse;
      stats = null;
      portfolio = null;
      accumulator = null;
      activeTab = "home";
      setupStep = "connect";
      render();
    }
  });

  // Invest now
  document.getElementById("btn-invest")?.addEventListener("click", () => {
    window.open("https://buff.finance/dashboard", "_blank");
  });
}

function saveAllocations() {
  chrome.storage.local.set({ popup_allocations: allocations });
}

// ── Utilities ──

function truncate(s: string): string {
  if (s.length <= 14) return s;
  return `${s.slice(0, 6)}...${s.slice(-4)}`;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ── Boot ──

document.addEventListener("DOMContentLoaded", init);
