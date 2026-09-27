// Custom Worker entry: OpenNext only ships a fetch handler.
// Cron triggers call scheduled(); we fan out to the protected cron routes.
//
// Markdown for Agents (content negotiation): GETs with
// `Accept: text/markdown` get a converted markdown response — Cloudflare's
// edge content_converter is Pro-only, so we do it here. Conversion runs
// AFTER the normal pipeline, so auth/rate limits are untouched; non-GETs,
// redirects, errors and non-HTML responses pass through unchanged.
//
// Discovery: /.well-known/api-catalog, /auth.md, /api/openapi.json, /api/docs
// and /api/ are served here (content in worker-discovery.ts), and HTML
// responses get RFC 8288 Link headers for those resources.
//
// crons in wrangler.toml:
//  - "* * * * *"     → expire Reservations holds
//  - "0 3 * * *"     → Google token health check + pending block backfill

// @ts-expect-error `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";
import TurndownService from "turndown";
import { createDocument } from "@mixmark-io/domino";
import { discoveryResponse, DISCOVERY_LINK_HEADER } from "./worker-discovery";

// HTMLRewriter is a Workers runtime global; @cloudflare/workers-types is not
// installed (it clashes with the DOM lib in tsconfig), so declare it locally.
interface WorkerHTMLRewriter {
  on(selector: string, handlers: { element(el: { remove(): void }): void }): WorkerHTMLRewriter;
  transform(response: Response): Response;
}
declare const HTMLRewriter: { new (): WorkerHTMLRewriter };

const JSONLD_RE = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const STRIP_SELECTOR = "script, style, noscript, svg, iframe, nav, footer";

function wantsMarkdown(request: Request): boolean {
  if (request.method !== "GET") return false;
  const accept = request.headers.get("accept");
  return !!accept && accept.toLowerCase().includes("text/markdown");
}

async function toMarkdownResponse(res: Response, html: string): Promise<Response> {
  // JSON-LD is extracted before stripping <script> so agents keep the
  // structured data Cloudflare's converter would have preserved.
  const jsonld: string[] = [];
  for (const m of html.matchAll(JSONLD_RE)) {
    const body = m[1].trim();
    if (body) jsonld.push(body);
  }

  const cleaned = await new HTMLRewriter()
    .on(STRIP_SELECTOR, {
      element(el) {
        el.remove();
      },
    })
    .transform(new Response(html))
    .text();

  const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
  // Turndown's browser build (esbuild platform=browser picks it) parses string
  // input via `document`, which Workers lack — so we parse with domino and pass
  // the document node, which takes the cloneNode path instead.
  let md = td.turndown(createDocument(cleaned));
  if (jsonld.length > 0) {
    md += `\n\n\`\`\`json\n${jsonld.join("\n")}\n\`\`\``;
  }

  const headers = new Headers(res.headers);
  // Body-specific headers no longer match the converted response.
  for (const h of [
    "etag",
    "last-modified",
    "content-encoding",
    "content-range",
    "transfer-encoding",
    "content-length",
  ]) {
    headers.delete(h);
  }
  headers.set("content-type", "text/markdown; charset=utf-8");
  // no-store: never let a cached markdown variant leak to browsers.
  headers.set("cache-control", "no-store");
  const vary = headers.get("vary");
  headers.set(
    "vary",
    vary && !vary.toLowerCase().includes("accept") ? `${vary}, accept` : "accept"
  );
  headers.set("x-markdown-tokens", String(Math.ceil(md.length / 4)));
  headers.set("x-original-tokens", String(Math.ceil(html.length / 4)));
  return new Response(md, { status: res.status, statusText: res.statusText, headers });
}

async function callCron(
  env: { NEXT_PUBLIC_BASE_URL?: string; CRON_SECRET?: string },
  path: string
): Promise<void> {
  const base = env.NEXT_PUBLIC_BASE_URL || "https://osakacastletours.com";
  const secret = env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] CRON_SECRET not set — skipping", path);
    return;
  }
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!res.ok) {
    console.error(`[cron] ${path} failed: ${res.status}`, await res.text());
  }
}

// RFC 8288: advertise machine-readable resources on HTML responses (the
// homepage Link header). Rebuilds the response because ASSETS-sourced
// headers can be immutable.
function withDiscoveryLink(res: Response): Response {
  const headers = new Headers(res.headers);
  headers.append("link", DISCOVERY_LINK_HEADER);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

const worker = {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const h = handler as any;

    const discovery = discoveryResponse(request);
    if (discovery) return discovery;

    const wantsMd = wantsMarkdown(request);
    const res0: Response = await h.fetch(request, env, ctx);
    const ct = res0.headers.get("content-type") ?? "";
    const res =
      ct.includes("text/html") && (request.method === "GET" || request.method === "HEAD")
        ? withDiscoveryLink(res0)
        : res0;

    if (!wantsMd) {
      return res;
    }
    if (!res.ok || !ct.includes("text/html")) {
      return res;
    }
    let html: string;
    try {
      html = await res.text();
    } catch {
      return res;
    }
    try {
      return await toMarkdownResponse(res, html);
    } catch (e) {
      console.error("[markdown] conversion failed:", e instanceof Error ? e.message : e);
      return new Response(html, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    }
  },
  async scheduled(
    event: { cron: string },
    env: { NEXT_PUBLIC_BASE_URL?: string; CRON_SECRET?: string },
    _ctx?: unknown
  ) {
    void _ctx;
    if (event.cron === "0 3 * * *") {
      await callCron(env, "/api/cron/google-token-health");
    } else {
      await callCron(env, "/api/cron/expire-reservations");
    }
  },
};

export default worker;

// Re-export Durable Objects used by OpenNext (required by wrangler)
// @ts-expect-error generated at build time
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
