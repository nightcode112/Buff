import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// Domain whitelist — only proxy known Solana dApp domains
const ALLOWED_DOMAINS = [
  "jup.ag",
  "jupiter.ag",
  "raydium.io",
  "tensor.trade",
  "magiceden.io",
  "magiceden.com",
  "marinade.finance",
  "orca.so",
  "drift.trade",
  "marginfi.com",
  "pump.fun",
  "axiom.trade",
  "gmgn.ai",
  "meteora.ag",
];

// Also allow CDN/asset domains these dApps use
const ALLOWED_ASSET_DOMAINS = [
  "cdn.jsdelivr.net",
  "unpkg.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cloudflare-ipfs.com",
  "arweave.net",
  "ipfs.io",
  "nftstorage.link",
  "shdw-drive.genesysgo.net",
  "img-cdn.magiceden.dev",
  "bafybeig",
  "tensor.s3",
  "static.jup.ag",
  "cache.jup.ag",
  "station.jup.ag",
  "quote-api.jup.ag",
  "price.jup.ag",
  "tokens.jup.ag",
  "api.raydium.io",
  "api-v3.raydium.io",
  "sdk.raydium.io",
  "api.mainnet-beta.solana.com",
  "api.tensor.so",
  "api.tensor.trade",
  "api-mainnet.magiceden.dev",
  "api.pump.fun",
  "frontend-api.pump.fun",
  "client-api-2-74b1891-production.up.railway.app",
  "gmgn.ai",
  "defi-api.gmgn.ai",
  "app.meteora.ag",
  "dlmm-api.meteora.ag",
  "amm-v2.meteora.ag",
  "stake-for-fee-api.meteora.ag",
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");

    // Check main whitelist
    const mainAllowed = ALLOWED_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith("." + d)
    );
    if (mainAllowed) return true;

    // Check asset/CDN domains
    const assetAllowed = ALLOWED_ASSET_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith("." + d) || hostname.includes(d)
    );
    return assetAllowed;
  } catch {
    return false;
  }
}

function isAllowedDAppDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return ALLOWED_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith("." + d)
    );
  } catch {
    return false;
  }
}

function rewriteHtml(html: string, baseUrl: string): string {
  const parsed = new URL(baseUrl);
  const origin = parsed.origin;

  // Inject our wallet provider script FIRST (before any dApp scripts run)
  // Also inject a script to set __BUFF_PROXY_ORIGIN so the inject script
  // knows the original dApp origin for URL rewriting
  const injectMeta = `<script>window.__BUFF_PROXY_ORIGIN="${origin}";window.__BUFF_PROXY_BASE="${parsed.pathname.replace(/\/[^/]*$/, "/")}";</script>`;
  const injectScript = `<script src="/buff-wallet-inject.js"></script>`;

  // Inject a <base> tag so relative URLs (images, CSS, etc.) resolve to the dApp origin
  const baseTag = `<base href="${origin}${parsed.pathname.replace(/\/[^/]*$/, "/")}">`;

  const headInjection = `${baseTag}${injectMeta}${injectScript}`;

  // Handle case-insensitive head tags and also handle <head with attributes
  if (/<head[\s>]/i.test(html)) {
    html = html.replace(/<head([\s>])/i, `<head$1${headInjection}`);
  } else if (/<html/i.test(html)) {
    html = html.replace(
      /(<html[^>]*>)/i,
      `$1<head>${headInjection}</head>`
    );
  } else {
    html = `${headInjection}${html}`;
  }

  // Remove any existing CSP meta tags that might block our scripts
  html = html.replace(
    /<meta[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*>/gi,
    ""
  );

  // Rewrite absolute URLs in href/src/action/srcset pointing to the same dApp domain
  // to go through the proxy
  const proxyPrefix = "/api/proxy?url=";
  html = html.replace(
    /((?:href|src|action|srcset)\s*=\s*["'])(https?:\/\/[^"'\s]+)(["'\s])/gi,
    (match, prefix, url, suffix) => {
      if (isAllowedUrl(url)) {
        return `${prefix}${proxyPrefix}${encodeURIComponent(url)}${suffix}`;
      }
      return match;
    }
  );

  return html;
}

function rewriteCss(css: string, baseUrl: string): string {
  const origin = new URL(baseUrl).origin;
  const pathBase = new URL(baseUrl).pathname.replace(/\/[^/]*$/, "/");

  // Rewrite url() references — handle absolute paths, relative paths, and full URLs
  return css.replace(
    /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
    (match, path: string) => {
      if (
        path.startsWith("data:") ||
        path.startsWith("blob:") ||
        path.startsWith("#")
      ) {
        return match;
      }

      if (path.startsWith("http://") || path.startsWith("https://")) {
        // Full URL — proxy if allowed
        if (isAllowedUrl(path)) {
          return `url("/api/proxy?url=${encodeURIComponent(path)}")`;
        }
        return match;
      }

      if (path.startsWith("/")) {
        // Absolute path — resolve against dApp origin
        return `url("${origin}${path}")`;
      }

      // Relative path — resolve against the CSS file's directory
      return `url("${origin}${pathBase}${path}")`;
    }
  );
}

function rewriteJsModuleUrls(js: string, baseUrl: string): string {
  const origin = new URL(baseUrl).origin;

  // Rewrite dynamic import() calls with absolute paths
  // e.g. import("/assets/chunk.js") → import("https://dapp.com/assets/chunk.js")
  js = js.replace(
    /(import\s*\(\s*["'])(\/[^"']+)(["']\s*\))/g,
    (match, prefix, path, suffix) => {
      return `${prefix}${origin}${path}${suffix}`;
    }
  );

  return js;
}

export async function GET(req: NextRequest) {
  // Apply proxy-specific rate limit: 120 req/min (higher than global due to asset loading)
  const rateLimited = rateLimit(req, { maxRequests: 120, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "url parameter required" },
      { status: 400 }
    );
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json(
      { error: "Domain not in whitelist" },
      { status: 403 }
    );
  }

  try {
    // Build headers — pass through accept/content-type from client
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "identity",
    };

    // For HTML pages, request HTML; for other resources, accept anything
    const clientAccept = req.headers.get("accept");
    if (clientAccept) {
      headers["Accept"] = clientAccept;
    } else {
      headers["Accept"] =
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
    }

    // Pass referer as the dApp origin (not buff.finance)
    const refererUrl = req.headers.get("referer");
    if (refererUrl) {
      try {
        // Extract the proxied URL from the referer's query string
        const refParsed = new URL(refererUrl);
        const proxiedRefUrl = refParsed.searchParams.get("url");
        if (proxiedRefUrl) {
          headers["Referer"] = proxiedRefUrl;
          headers["Origin"] = new URL(proxiedRefUrl).origin;
        }
      } catch {}
    }

    const response = await fetch(url, {
      headers,
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";
    const responseHeaders: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    // Copy cache-related headers from upstream
    const cacheControl = response.headers.get("cache-control");
    if (cacheControl) {
      responseHeaders["Cache-Control"] = cacheControl;
    }

    // Handle redirects that returned HTML with meta refresh or JS redirects
    // by also handling Location headers (though fetch follows them)

    // HTML responses — rewrite and inject
    if (contentType.includes("text/html")) {
      let html = await response.text();
      html = rewriteHtml(html, url);

      return new NextResponse(html, {
        status: 200,
        headers: {
          ...responseHeaders,
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // CSS — rewrite url() references
    if (contentType.includes("text/css")) {
      let css = await response.text();
      css = rewriteCss(css, url);

      return new NextResponse(css, {
        status: 200,
        headers: {
          ...responseHeaders,
          "Content-Type": contentType,
          "Cache-Control": cacheControl || "public, max-age=3600",
        },
      });
    }

    // JavaScript — rewrite dynamic import paths
    if (
      contentType.includes("javascript") ||
      contentType.includes("ecmascript") ||
      url.endsWith(".js") ||
      url.endsWith(".mjs")
    ) {
      let js = await response.text();
      js = rewriteJsModuleUrls(js, url);

      return new NextResponse(js, {
        status: 200,
        headers: {
          ...responseHeaders,
          "Content-Type": contentType || "application/javascript",
          "Cache-Control": cacheControl || "public, max-age=3600",
        },
      });
    }

    // JSON API responses — pass through
    if (contentType.includes("application/json")) {
      const body = await response.arrayBuffer();
      return new NextResponse(body, {
        status: response.status,
        headers: {
          ...responseHeaders,
          "Content-Type": contentType,
          "Cache-Control": "no-cache",
        },
      });
    }

    // Everything else (images, fonts, WASM, etc.) — pass through with aggressive caching
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        ...responseHeaders,
        "Content-Type": contentType,
        "Cache-Control": cacheControl || "public, max-age=86400",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Proxy error: ${err instanceof Error ? err.message : "unknown"}`,
      },
      { status: 502 }
    );
  }
}

// Handle POST requests (for dApp API calls like Jupiter quote, Raydium swap, etc.)
export async function POST(req: NextRequest) {
  const rateLimited = rateLimit(req, { maxRequests: 120, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "url parameter required" },
      { status: 400 }
    );
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json(
      { error: "Domain not in whitelist" },
      { status: 403 }
    );
  }

  try {
    const body = await req.arrayBuffer();
    const contentType = req.headers.get("content-type") || "application/json";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: req.headers.get("accept") || "application/json",
      },
      body,
      redirect: "follow",
    });

    const resContentType = response.headers.get("content-type") || "";
    const resBody = await response.arrayBuffer();

    return new NextResponse(resBody, {
      status: response.status,
      headers: {
        "Content-Type": resContentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Proxy POST error: ${err instanceof Error ? err.message : "unknown"}`,
      },
      { status: 502 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  });
}
