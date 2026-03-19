/**
 * Buff dApp Browser — Wallet Provider Injection
 *
 * Injected into proxied dApp pages. Creates a fake window.solana / window.phantom.solana
 * provider that communicates with the parent Buff browse page via postMessage.
 * Also rewrites fetch/XHR/WebSocket to route through the proxy.
 *
 * CRITICAL: Fail-open. If anything fails, the dApp should still work.
 */

(function () {
  "use strict";

  if (window.__buffWalletInjected) return;
  window.__buffWalletInjected = true;

  var BUFF_CHANNEL = "buff-dapp-browser";
  var messageId = 0;
  var pendingRequests = new Map();
  var PROXY_ORIGIN = window.__BUFF_PROXY_ORIGIN || "";
  var PROXY_PREFIX = "/api/proxy?url=";

  // Domain whitelist — must match server-side whitelist
  var ALLOWED_DOMAINS = [
    "jup.ag", "jupiter.ag", "raydium.io", "tensor.trade",
    "magiceden.io", "magiceden.com", "marinade.finance", "orca.so",
    "drift.trade", "marginfi.com", "pump.fun", "axiom.trade",
    "gmgn.ai", "meteora.ag",
    // CDN/API domains
    "cdn.jsdelivr.net", "unpkg.com", "fonts.googleapis.com", "fonts.gstatic.com",
    "arweave.net", "ipfs.io", "nftstorage.link", "shdw-drive.genesysgo.net",
    "static.jup.ag", "cache.jup.ag", "station.jup.ag", "quote-api.jup.ag",
    "price.jup.ag", "tokens.jup.ag",
    "api.raydium.io", "api-v3.raydium.io", "sdk.raydium.io",
    "api.mainnet-beta.solana.com",
    "api.tensor.so", "api.tensor.trade",
    "api-mainnet.magiceden.dev", "img-cdn.magiceden.dev",
    "api.pump.fun", "frontend-api.pump.fun",
    "defi-api.gmgn.ai",
    "app.meteora.ag", "dlmm-api.meteora.ag", "amm-v2.meteora.ag",
    "stake-for-fee-api.meteora.ag",
  ];

  function isProxyableUrl(url) {
    try {
      var hostname = new URL(url).hostname.replace(/^www\./, "");
      for (var i = 0; i < ALLOWED_DOMAINS.length; i++) {
        var d = ALLOWED_DOMAINS[i];
        if (hostname === d || hostname.endsWith("." + d)) return true;
      }
    } catch (e) {}
    return false;
  }

  function shouldProxy(url) {
    if (!url || typeof url !== "string") return false;
    if (!url.startsWith("http")) return false;
    if (url.includes("/api/proxy")) return false;
    try {
      var parsed = new URL(url);
      // Already on our origin = already proxied
      if (parsed.origin === window.location.origin) return false;
      return isProxyableUrl(url);
    } catch (e) {
      return false;
    }
  }

  function proxyUrl(url) {
    return PROXY_PREFIX + encodeURIComponent(url);
  }

  // ── Message bridge to parent frame ──

  function sendToParent(type, payload) {
    return new Promise(function (resolve, reject) {
      var id = "buff-dapp-" + (++messageId) + "-" + Date.now();
      var timeout = setTimeout(function () {
        pendingRequests.delete(id);
        resolve({ error: "timeout" }); // Fail-open
      }, 15000);

      pendingRequests.set(id, {
        resolve: function (v) { clearTimeout(timeout); resolve(v); },
        reject: function (e) { clearTimeout(timeout); reject(e); },
      });

      window.parent.postMessage(
        { channel: BUFF_CHANNEL, type: type, id: id, payload: payload },
        "*"
      );
    });
  }

  window.addEventListener("message", function (event) {
    if (event.data && event.data.channel === BUFF_CHANNEL) {
      var id = event.data.id;
      var payload = event.data.payload;
      var pending = pendingRequests.get(id);
      if (pending) {
        pendingRequests.delete(id);
        pending.resolve(payload);
      }
    }
  });

  // ── Fake PublicKey class ──

  function FakePublicKey(value) {
    if (typeof value === "string") {
      this._base58 = value;
    } else if (value && value._base58) {
      this._base58 = value._base58;
    } else if (value && typeof value.toBase58 === "function") {
      this._base58 = value.toBase58();
    } else {
      this._base58 = "";
    }
  }
  FakePublicKey.prototype.toBase58 = function () { return this._base58; };
  FakePublicKey.prototype.toString = function () { return this._base58; };
  FakePublicKey.prototype.toJSON = function () { return this._base58; };
  FakePublicKey.prototype.toBytes = function () { return new Uint8Array(32); };
  FakePublicKey.prototype.toBuffer = function () { return new Uint8Array(32); };
  FakePublicKey.prototype.equals = function (other) {
    if (!other) return false;
    var otherKey = (typeof other.toBase58 === "function") ? other.toBase58() : String(other);
    return otherKey === this._base58;
  };

  // ── Buff Wallet Provider ──

  var connectedPubkey = null;

  var buffProvider = {
    isPhantom: true,
    isBuff: true,
    isConnected: false,
    publicKey: null,

    connect: function (opts) {
      return sendToParent("WALLET_CONNECT", opts || {}).then(function (result) {
        if (result && result.pubkey) {
          connectedPubkey = result.pubkey;
          buffProvider.isConnected = true;
          buffProvider.publicKey = new FakePublicKey(connectedPubkey);
          emitEvent("connect", buffProvider.publicKey);
          return { publicKey: buffProvider.publicKey };
        }
        throw new Error((result && result.error) || "Connection failed");
      });
    },

    disconnect: function () {
      connectedPubkey = null;
      buffProvider.isConnected = false;
      buffProvider.publicKey = null;
      emitEvent("disconnect");
      window.parent.postMessage(
        { channel: BUFF_CHANNEL, type: "WALLET_DISCONNECT" },
        "*"
      );
      return Promise.resolve();
    },

    signTransaction: function (transaction) {
      var serialized = serializeTx(transaction);
      return sendToParent("SIGN_TRANSACTION", {
        transaction: serialized,
      }).then(function (result) {
        if (result && result.signedTransaction) {
          return deserializeTx(result.signedTransaction, transaction);
        }
        if (result && result.error) throw new Error(result.error);
        return transaction; // Fail-open
      });
    },

    signAllTransactions: function (transactions) {
      var serialized = transactions.map(serializeTx);
      return sendToParent("SIGN_ALL_TRANSACTIONS", {
        transactions: serialized,
      }).then(function (result) {
        if (result && result.signedTransactions) {
          return result.signedTransactions.map(function (st, i) {
            return deserializeTx(st, transactions[i]);
          });
        }
        if (result && result.error) throw new Error(result.error);
        return transactions;
      });
    },

    signMessage: function (message, display) {
      var msgBase64;
      if (message instanceof Uint8Array) {
        msgBase64 = arrayToBase64(message);
      } else if (typeof message === "string") {
        msgBase64 = btoa(message);
      } else {
        msgBase64 = arrayToBase64(new Uint8Array(message));
      }
      return sendToParent("SIGN_MESSAGE", {
        message: msgBase64,
        display: display,
      }).then(function (result) {
        if (result && result.signature) {
          var sigBytes = base64ToArray(result.signature);
          return { signature: sigBytes, publicKey: buffProvider.publicKey };
        }
        if (result && result.error) throw new Error(result.error);
        throw new Error("Sign message failed");
      });
    },

    signAndSendTransaction: function (transaction, options) {
      var serialized = serializeTx(transaction);
      return sendToParent("SIGN_AND_SEND_TRANSACTION", {
        transaction: serialized,
        options: options,
      }).then(function (result) {
        if (result && result.signature) {
          return { signature: result.signature, publicKey: buffProvider.publicKey };
        }
        if (result && result.error) throw new Error(result.error);
        throw new Error("signAndSendTransaction failed");
      });
    },

    // Event emitter (Phantom-compatible)
    _listeners: {},
    on: function (event, callback) {
      if (!buffProvider._listeners[event]) buffProvider._listeners[event] = [];
      buffProvider._listeners[event].push(callback);
      return buffProvider;
    },
    off: function (event, callback) {
      if (!buffProvider._listeners[event]) return buffProvider;
      buffProvider._listeners[event] = buffProvider._listeners[event].filter(
        function (cb) { return cb !== callback; }
      );
      return buffProvider;
    },
    addListener: function (event, callback) { return buffProvider.on(event, callback); },
    removeListener: function (event, callback) { return buffProvider.off(event, callback); },
    removeAllListeners: function (event) {
      if (event) { delete buffProvider._listeners[event]; }
      else { buffProvider._listeners = {}; }
      return buffProvider;
    },
  };

  function emitEvent(event) {
    var args = Array.prototype.slice.call(arguments, 1);
    var cbs = buffProvider._listeners[event];
    if (cbs) {
      for (var i = 0; i < cbs.length; i++) {
        try { cbs[i].apply(null, args); } catch (e) {}
      }
    }
  }

  // ── Transaction serialization helpers ──

  function serializeTx(tx) {
    try {
      if (tx.serialize) {
        var bytes = tx.serialize({ verifySignatures: false, requireAllSignatures: false });
        return arrayToBase64(bytes);
      }
      if (tx.message && tx.message.serialize) {
        var msgBytes = tx.message.serialize();
        return arrayToBase64(msgBytes);
      }
    } catch (e) {}
    try { return btoa(JSON.stringify(tx)); } catch (e2) { return ""; }
  }

  function deserializeTx(base64, originalTx) {
    try {
      var bytes = base64ToArray(base64);
      // Try using web3.js from the dApp's bundle (multiple possible globals)
      var web3 = window.solanaWeb3 || window["@solana/web3.js"];
      if (web3 && web3.VersionedTransaction) {
        try { return web3.VersionedTransaction.deserialize(bytes); } catch (e) {}
      }
      if (web3 && web3.Transaction) {
        try { return web3.Transaction.from(bytes); } catch (e2) {}
      }
      originalTx._signedBytes = bytes;
      return originalTx;
    } catch (e3) {
      return originalTx;
    }
  }

  function arrayToBase64(arr) {
    var bytes = arr instanceof Uint8Array ? arr : new Uint8Array(arr);
    var binary = "";
    for (var i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToArray(b64) {
    var binary = atob(b64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // ── Install provider (trap window.solana / window.phantom) ──

  function installProvider() {
    var descriptor = {
      configurable: true,
      enumerable: true,
      get: function () { return buffProvider; },
      set: function () { return true; },
    };

    try { Object.defineProperty(window, "solana", descriptor); } catch (e) {}

    try {
      Object.defineProperty(window, "phantom", {
        configurable: true,
        enumerable: true,
        get: function () { return { solana: buffProvider }; },
        set: function () { return true; },
      });
    } catch (e2) {}

    try { Object.defineProperty(window, "solflare", descriptor); } catch (e3) {}

    // Also announce via the standard wallet registration event
    try {
      window.dispatchEvent(new Event("wallet-standard:register"));
    } catch (e4) {}
  }

  installProvider();

  // Re-install after a delay to beat late-loading wallets
  setTimeout(installProvider, 100);
  setTimeout(installProvider, 500);
  setTimeout(installProvider, 2000);

  // ── Rewrite fetch to go through proxy ──

  var originalFetch = window.fetch;

  window.fetch = function (input, init) {
    try {
      var url;
      if (typeof input === "string") {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
      } else if (input instanceof URL) {
        url = input.toString();
      }

      if (url && shouldProxy(url)) {
        var proxiedUrl = proxyUrl(url);
        if (typeof input === "string") {
          return originalFetch.call(window, proxiedUrl, init);
        } else if (input instanceof Request) {
          // Reconstruct request with new URL but preserve method/headers/body
          var newInit = {
            method: input.method,
            headers: input.headers,
            body: input.body,
            mode: "cors",
            credentials: "omit",
            redirect: input.redirect,
          };
          return originalFetch.call(window, proxiedUrl, newInit);
        }
      }

      // Handle relative URLs that should go to the dApp origin
      if (url && PROXY_ORIGIN && url.startsWith("/") && !url.startsWith("/api/")) {
        var absoluteUrl = PROXY_ORIGIN + url;
        if (isProxyableUrl(absoluteUrl)) {
          var proxied = proxyUrl(absoluteUrl);
          if (typeof input === "string") {
            return originalFetch.call(window, proxied, init);
          }
        }
      }
    } catch (e) {}

    return originalFetch.call(window, input, init);
  };

  // ── Rewrite XMLHttpRequest ──

  var OrigXHR = window.XMLHttpRequest;
  var origOpen = OrigXHR.prototype.open;

  OrigXHR.prototype.open = function (method, url) {
    var args = Array.prototype.slice.call(arguments);
    try {
      if (typeof url === "string") {
        if (shouldProxy(url)) {
          args[1] = proxyUrl(url);
        } else if (PROXY_ORIGIN && url.startsWith("/") && !url.startsWith("/api/")) {
          var abs = PROXY_ORIGIN + url;
          if (isProxyableUrl(abs)) {
            args[1] = proxyUrl(abs);
          }
        }
      }
    } catch (e) {}
    return origOpen.apply(this, args);
  };

  // ── Rewrite WebSocket connections ──

  var OriginalWebSocket = window.WebSocket;

  window.WebSocket = function BuffWebSocket(url, protocols) {
    // WebSocket URLs can't go through an HTTP proxy, but we can rewrite
    // wss://dapp.com/ws to wss://buff.finance/api/ws?url=... if we had a WS proxy.
    // Since we don't, we pass WebSocket connections through directly — they'll
    // connect to the dApp's real WebSocket server. This is fine because WebSocket
    // connections don't need same-origin and don't carry wallet provider context.
    // The wallet injection still works because it's in the page context.
    try {
      if (protocols !== undefined) {
        return new OriginalWebSocket(url, protocols);
      }
      return new OriginalWebSocket(url);
    } catch (e) {
      return new OriginalWebSocket(url);
    }
  };

  // Preserve prototype chain for instanceof checks
  window.WebSocket.prototype = OriginalWebSocket.prototype;
  window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
  window.WebSocket.OPEN = OriginalWebSocket.OPEN;
  window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
  window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;

  // ── Rewrite dynamic imports (for SPA chunk loading) ──

  // Override importScripts if in worker context (it won't be, but safety)
  if (typeof importScripts === "function") {
    var origImportScripts = importScripts;
    importScripts = function () {
      var args = Array.prototype.slice.call(arguments).map(function (url) {
        if (shouldProxy(url)) return proxyUrl(url);
        return url;
      });
      return origImportScripts.apply(this, args);
    };
  }

  // ── Override createElement to intercept dynamically added scripts ──

  var origCreateElement = document.createElement.bind(document);

  document.createElement = function (tagName) {
    var args = Array.prototype.slice.call(arguments);
    var el = origCreateElement.apply(document, args);

    if (tagName.toLowerCase() === "script") {
      var origSrcDescriptor = Object.getOwnPropertyDescriptor(
        HTMLScriptElement.prototype, "src"
      );

      if (origSrcDescriptor && origSrcDescriptor.set) {
        Object.defineProperty(el, "src", {
          configurable: true,
          enumerable: true,
          get: function () {
            return origSrcDescriptor.get.call(el);
          },
          set: function (val) {
            if (typeof val === "string" && shouldProxy(val)) {
              origSrcDescriptor.set.call(el, proxyUrl(val));
            } else if (typeof val === "string" && PROXY_ORIGIN && val.startsWith("/") && !val.startsWith("/api/") && !val.startsWith("/buff-wallet")) {
              var abs = PROXY_ORIGIN + val;
              if (isProxyableUrl(abs)) {
                origSrcDescriptor.set.call(el, proxyUrl(abs));
              } else {
                origSrcDescriptor.set.call(el, val);
              }
            } else {
              origSrcDescriptor.set.call(el, val);
            }
          },
        });
      }
    }

    if (tagName.toLowerCase() === "link") {
      var origHrefDescriptor = Object.getOwnPropertyDescriptor(
        HTMLLinkElement.prototype, "href"
      );

      if (origHrefDescriptor && origHrefDescriptor.set) {
        Object.defineProperty(el, "href", {
          configurable: true,
          enumerable: true,
          get: function () {
            return origHrefDescriptor.get.call(el);
          },
          set: function (val) {
            if (typeof val === "string" && shouldProxy(val)) {
              origHrefDescriptor.set.call(el, proxyUrl(val));
            } else if (typeof val === "string" && PROXY_ORIGIN && val.startsWith("/") && !val.startsWith("/api/")) {
              var abs = PROXY_ORIGIN + val;
              if (isProxyableUrl(abs)) {
                origHrefDescriptor.set.call(el, proxyUrl(abs));
              } else {
                origHrefDescriptor.set.call(el, val);
              }
            } else {
              origHrefDescriptor.set.call(el, val);
            }
          },
        });
      }
    }

    return el;
  };

  // ── Listen for parent auto-connect ──

  window.addEventListener("message", function (event) {
    if (!event.data || event.data.channel !== BUFF_CHANNEL) return;
    if (event.data.type === "AUTO_CONNECT") {
      var pubkey = event.data.payload && event.data.payload.pubkey;
      if (pubkey) {
        connectedPubkey = pubkey;
        buffProvider.isConnected = true;
        buffProvider.publicKey = new FakePublicKey(pubkey);
        emitEvent("connect", buffProvider.publicKey);
        // Also emit accountChanged for dApps that listen for it
        emitEvent("accountChanged", buffProvider.publicKey);
      }
    }
  });

  // Request auto-connect from parent
  window.parent.postMessage(
    { channel: BUFF_CHANNEL, type: "REQUEST_AUTO_CONNECT" },
    "*"
  );

  console.log("[Buff] dApp browser wallet provider injected");
})();
