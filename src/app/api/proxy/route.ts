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

    const mainAllowed = ALLOWED_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith("." + d)
    );
    if (mainAllowed) return true;

    const assetAllowed = ALLOWED_ASSET_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith("." + d) || hostname.includes(d)
    );
    return assetAllowed;
  } catch {
    return false;
  }
}

const P = "/api/proxy?url=";

function rewriteHtml(html: string, baseUrl: string): string {
  const parsed = new URL(baseUrl);
  const origin = parsed.origin;

  // Inject wallet script + origin info (BEFORE any dApp scripts)
  const injectMeta = `<script>window.__BUFF_PROXY_ORIGIN="${origin}";</script>`;
  const injectScript = `<script src="/buff-wallet-inject.js"></script>`;

  // NO <base> tag — it doesn't help with /-prefixed paths and breaks SPA routers.
  // Instead we rewrite every src/href in the HTML directly.
  const headInjection = `${injectMeta}${injectScript}`;

  if (/<head[\s>]/i.test(html)) {
    // Inject AFTER the full <head ...> tag (including any attributes)
    html = html.replace(/(<head[^>]*>)/i, `$1${headInjection}`);
  } else if (/<html/i.test(html)) {
    html = html.replace(/(<html[^>]*>)/i, `$1<head>${headInjection}</head>`);
  } else {
    html = `${headInjection}${html}`;
  }

  // Remove CSP meta tags that block our scripts
  html = html.replace(
    /<meta[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*>/gi,
    ""
  );

  // Rewrite all src/href/action/srcset attributes:
  // 1. Full URLs (https://...) to whitelisted domains → proxy
  // 2. Root-relative paths (/_next/..., /assets/...) → proxy through dApp origin
  // 3. Skip: data:, blob:, #, javascript:, /api/proxy, /buff-wallet
  html = html.replace(
    /((?:href|src|action)\s*=\s*["'])([^"']+)(["'])/gi,
    (match, prefix, rawUrl: string, suffix) => {
      const url = rawUrl.trim();

      // Skip special protocols and our own resources
      if (
        url.startsWith("data:") ||
        url.startsWith("blob:") ||
        url.startsWith("#") ||
        url.startsWith("javascript:") ||
        url.startsWith("/api/proxy") ||
        url.startsWith("/buff-wallet")
      ) {
        return match;
      }

      // Full URL → proxy if whitelisted
      if (url.startsWith("http://") || url.startsWith("https://")) {
        if (isAllowedUrl(url)) {
          return `${prefix}${P}${encodeURIComponent(url)}${suffix}`;
        }
        return match;
      }

      // Root-relative path → resolve against dApp origin and proxy
      if (url.startsWith("/")) {
        return `${prefix}${P}${encodeURIComponent(origin + url)}${suffix}`;
      }

      // Relative path → resolve against dApp page directory
      const dir = parsed.pathname.replace(/\/[^/]*$/, "/");
      return `${prefix}${P}${encodeURIComponent(origin + dir + url)}${suffix}`;
    }
  );

  // Also rewrite srcset (space-separated URLs)
  html = html.replace(
    /(srcset\s*=\s*["'])([^"']+)(["'])/gi,
    (match, prefix, srcset: string, suffix) => {
      const rewritten = srcset.replace(
        /((?:https?:\/\/[^\s,]+)|(?:\/[^\s,]+))/g,
        (srcUrl) => {
          if (srcUrl.startsWith("http")) {
            if (isAllowedUrl(srcUrl)) {
              return `${P}${encodeURIComponent(srcUrl)}`;
            }
            return srcUrl;
          }
          if (srcUrl.startsWith("/")) {
            return `${P}${encodeURIComponent(origin + srcUrl)}`;
          }
          return srcUrl;
        }
      );
      return `${prefix}${rewritten}${suffix}`;
    }
  );

  return html;
}

function rewriteCss(css: string, baseUrl: string): string {
  const origin = new URL(baseUrl).origin;
  const pathBase = new URL(baseUrl).pathname.replace(/\/[^/]*$/, "/");

  return css.replace(
    /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
    (match, path: string) => {
      if (path.startsWith("data:") || path.startsWith("blob:") || path.startsWith("#")) {
        return match;
      }

      if (path.startsWith("http://") || path.startsWith("https://")) {
        if (isAllowedUrl(path)) {
          return `url("${P}${encodeURIComponent(path)}")`;
        }
        return match;
      }

      // Root-relative → proxy through dApp origin
      if (path.startsWith("/")) {
        return `url("${P}${encodeURIComponent(origin + path)}")`;
      }

      // Relative → resolve against CSS file directory
      return `url("${P}${encodeURIComponent(origin + pathBase + path)}")`;
    }
  );
}

function rewriteJsModuleUrls(js: string, baseUrl: string): string {
  const origin = new URL(baseUrl).origin;
  const proxyNextPrefix = `${P}${encodeURIComponent(origin + "/_next/")}`;

  // Rewrite webpack's public path: "/_next/" → proxy URL
  // This is the key fix for dynamic chunk loading in Next.js SPAs.
  // Webpack sets __webpack_require__.p = "/_next/" which is used as
  // the base URL for all dynamically loaded chunks.
  // Minified patterns: .p="/_next/", .p = "/_next/", ="/_next/"
  js = js.replace(
    /([=,])\s*"\/\_next\/"/g,
    `$1"${proxyNextPrefix}"`
  );
  js = js.replace(
    /([=,])\s*'\/\_next\/'/g,
    `$1'${proxyNextPrefix}'`
  );

  // Rewrite dynamic import() with absolute paths
  js = js.replace(
    /(import\s*\(\s*["'])(\/[^"']+)(["']\s*\))/g,
    (_match, prefix, path, suffix) => {
      return `${prefix}${P}${encodeURIComponent(origin + path)}${suffix}`;
    }
  );

  return js;
}

export async function GET(req: NextRequest) {
  const rateLimited = rateLimit(req, { maxRequests: 300, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: "Domain not in whitelist" }, { status: 403 });
  }

  try {
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "identity",
    };

    const clientAccept = req.headers.get("accept");
    if (clientAccept) {
      headers["Accept"] = clientAccept;
    } else {
      headers["Accept"] =
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
    }

    // Send referer/origin as the dApp's origin
    const refererUrl = req.headers.get("referer");
    if (refererUrl) {
      try {
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

    const cacheControl = response.headers.get("cache-control");
    if (cacheControl) {
      responseHeaders["Cache-Control"] = cacheControl;
    }

    // HTML — rewrite and inject
    if (contentType.includes("text/html")) {
      let html = await response.text();
      html = rewriteHtml(html, url);

      return new NextResponse(html, {
        status: 200,
        headers: { ...responseHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // CSS — rewrite url() references
    if (contentType.includes("text/css") || url.endsWith(".css")) {
      let css = await response.text();
      css = rewriteCss(css, url);

      return new NextResponse(css, {
        status: 200,
        headers: {
          ...responseHeaders,
          "Content-Type": contentType || "text/css",
          "Cache-Control": cacheControl || "public, max-age=3600",
        },
      });
    }

    // JavaScript — rewrite dynamic imports
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

    // JSON — pass through
    if (contentType.includes("application/json")) {
      const body = await response.arrayBuffer();
      return new NextResponse(body, {
        status: response.status,
        headers: { ...responseHeaders, "Content-Type": contentType, "Cache-Control": "no-cache" },
      });
    }

    // Everything else (images, fonts, WASM, etc.)
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
      { error: `Proxy error: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 502 }
    );
  }
}

// POST — for dApp API calls (Jupiter quote, Raydium swap, etc.)
export async function POST(req: NextRequest) {
  const rateLimited = rateLimit(req, { maxRequests: 300, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }
  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: "Domain not in whitelist" }, { status: 403 });
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
      { error: `Proxy POST error: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 502 }
    );
  }
}

// CORS preflight
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
