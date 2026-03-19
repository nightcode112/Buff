/**
 * Buff dApp Browser — Service Worker
 *
 * Intercepts ALL requests from proxied dApp content.
 * When webpack/Next.js requests /_next/static/... or other root-relative
 * paths that 404 on buff.finance, the SW retries them through the proxy
 * pointing to the correct dApp origin.
 *
 * This solves webpack chunk loading without ANY JavaScript rewriting.
 */

var PROXY_PREFIX = "/api/proxy?url=";
var currentDappOrigin = null;

// Listen for messages from the browse page
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SET_DAPP_ORIGIN") {
    currentDappOrigin = event.data.origin;
  }
});

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);

  // Only intercept requests to our own origin (buff.finance)
  if (url.origin !== self.location.origin) return;

  // Don't intercept our own API, static assets, or the SW itself
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/buff-") ||
    url.pathname === "/buff-sw.js"
  ) {
    return;
  }

  // If no dApp is set, don't intercept
  if (!currentDappOrigin) return;

  // Intercept paths that look like dApp assets (not buff.finance pages)
  // These are the ones webpack tries to load: /_next/static/..., /static/..., fonts, etc.
  var shouldProxy =
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/static/") ||
    url.pathname.startsWith("/cf-fonts/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/logos/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/svg/") ||
    url.pathname.startsWith("/__next") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".webmanifest") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg");

  // Also intercept RSC (React Server Components) flight requests
  if (url.searchParams.has("_rsc")) {
    shouldProxy = true;
  }

  if (!shouldProxy) return;

  // Strategy: try buff.finance first, if 404 → proxy to dApp
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response.ok || response.status === 304) {
          // It's a real buff.finance file, serve it
          return response;
        }

        // 404 or other error — this is a dApp asset, proxy it
        var proxyUrl =
          PROXY_PREFIX +
          encodeURIComponent(currentDappOrigin + url.pathname + url.search);
        return fetch(proxyUrl, {
          headers: event.request.headers,
          method: event.request.method,
        });
      })
      .catch(function () {
        // Network error — try proxy as fallback
        var proxyUrl =
          PROXY_PREFIX +
          encodeURIComponent(currentDappOrigin + url.pathname + url.search);
        return fetch(proxyUrl);
      })
  );
});
