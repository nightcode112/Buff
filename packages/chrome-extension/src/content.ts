export {}; // Make this file a module to avoid global scope conflicts

/**
 * Content Script — Bridge between inject.ts and background.ts
 *
 * 1. Injects inject.js into the page context at document_start
 * 2. Relays messages bidirectionally:
 *    - inject.ts → window.postMessage → content.ts → chrome.runtime.sendMessage → background.ts
 *    - background.ts → chrome.tabs.sendMessage → content.ts → window.postMessage → inject.ts
 */

const BUFF_CHANNEL = "buff-extension";

// ── Inject the page-context script ──

function injectScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

injectScript();

// ── Pending wallet operations (from background, waiting for inject response) ──

const pendingWalletOps = new Map<string, (payload: unknown) => void>();

// ── Message relay: inject (page) → background ──

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.channel !== BUFF_CHANNEL) return;
  if (!event.data?.type || !event.data?.id) return;

  const { type, id, payload } = event.data;

  // Check if this is a response to a pending wallet operation
  if (
    type === "BUFF_WALLET_CONNECT_RESPONSE" ||
    type === "BUFF_WALLET_SIGN_RESPONSE"
  ) {
    const resolve = pendingWalletOps.get(id);
    if (resolve) {
      pendingWalletOps.delete(id);
      resolve(payload);
    }
    return;
  }

  // Forward wrap/state/price requests to background service worker
  chrome.runtime.sendMessage({ type, payload }, (response) => {
    // Relay response back to inject.ts
    window.postMessage(
      {
        channel: BUFF_CHANNEL,
        type: type.replace("_REQUEST", "_RESPONSE"),
        id,
        payload: response,
      },
      "*"
    );
  });
});

// ── Message relay: background → inject (for wallet operations) ──

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message?.type) return false;

  if (message.type === "BUFF_WALLET_CONNECT" || message.type === "BUFF_WALLET_SIGN") {
    const id = message.id || `bg-${Date.now()}`;

    // Set up a promise to wait for inject.ts response
    const responsePromise = new Promise<unknown>((resolve) => {
      const timeout = setTimeout(() => {
        pendingWalletOps.delete(id);
        resolve({ error: "Wallet operation timed out" });
      }, 60000); // 60s timeout for user interaction

      pendingWalletOps.set(id, (payload) => {
        clearTimeout(timeout);
        resolve(payload);
      });
    });

    // Forward to inject.ts via postMessage
    window.postMessage(
      {
        channel: BUFF_CHANNEL,
        type: message.type,
        id,
        payload: message.payload || {},
      },
      "*"
    );

    // Wait for response from inject.ts, then send back to background
    responsePromise.then((result) => {
      sendResponse(result);
    });

    return true; // async response
  }

  return false;
});
