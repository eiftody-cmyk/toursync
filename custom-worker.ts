// Custom Worker entry: OpenNext only ships a fetch handler.
// Cron triggers call scheduled(); we fan out to the protected cron routes.
//
// crons in wrangler.toml:
//  - "* * * * *"     → expire Reservations holds
//  - "0 3 * * *"     → Google token health check

// @ts-expect-error `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";

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
    console.error(`[cron] ${path} failed:`, res.status, await res.text());
  }
}

const worker = {
  fetch(request: Request, env: unknown, ctx: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (handler as any).fetch(request, env, ctx);
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
