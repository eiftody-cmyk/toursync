# SECURITY.md — toursync / ExperienceRelay

Security hardening status, threat model, and test battery for the toursync platform
(osakacastletours.com on Cloudflare Workers + Supabase).

## CONTEXT

| Field | Value |
|---|---|
| Project | toursync — ExperienceRelay booking platform |
| Runtime | Next.js on Cloudflare Workers (OpenNext), Supabase (Postgres + RLS), PayPal (live), GYG Supplier API, Resend (email) |
| Code-execution harness | opencode CLI on macOS (tools: bash, file edit, web fetch) |
| Isolation | None (harness runs as the OS user; Worker is sandboxed by Cloudflare) |
| Network | Unrestricted |
| Filesystem | Full user access |
| Resource limits | None applied |
| Output capture | stdout/stderr → agent |
| Existing security tests | None (added in `security-tests/`) |

## Threat model

The highest-value target is **customer money and PII**. Attack surfaces, by priority:

1. **Public read of all `bookings`** (customer name/email/date) via the anon key + `using(true)`
   RLS policy. **Fixed** in migration `022_revoke_anon_read_bookings.sql`; public server reads
   now use the service-role client.
2. **PayPal webhook with no signature verification.** **Fixed** — webhook now verifies the
   PayPal JWS signature (ES256/RS256) via Web Crypto, checks transmission headers + freshness,
   writes with the service client, and de-dupes on `paypal_order` id. Invalid events return 201
   (halts PayPal retries).
3. **`capture-order` trusted client inputs.** **Fixed** — after capture it fetches the order and
   verifies `custom_id` + amount against server-computed price × guests, and de-dupes.
4. **Secret sprawl.** Vercel env files + folders **deleted** (verified all secrets live in
   Cloudflare Worker secrets). `.env.local` stripped of `VERCEL_*`/`NEXT_PUBLIC_APP_URL`, chmod 600.
   opencode config ⇒ chmod 600 (rotate any keys that were exposed).
5. **No rate limiting.** **Added** lightweight per-IP limit on `/api/paypal/*`, `/api/auth/google/*`,
   `/api/webhooks/paypal`.
6. **GYG Supplier API** credentials are Basic-auth (already the only correct mechanism); no changes
   needed, included in smoke tests.

What an unauthenticated attacker **cannot** do: mint PayPal charges (PayPal only captures an order
the buyer approved, once) or forge a webhook to move money. The remaining realistic paths to
"extra billing" require a compromised secret/host — hence the secret hygiene above.

## Hardening log

| Date | Change |
|---|---|
| 2026-09-12 | Migration 022: revoke anon `SELECT` on `bookings`; drop `Public can view bookings` policy |
| 2026-09-12 | Public booking reads (`available-dates`, `create-order`, `book/manage`) → service-role client |
| 2026-09-12 | PayPal webhook: signature verification (ES256/RS256 Web Crypto), service-client writes, dedup, 201-on-invalid |
| 2026-09-12 | `capture-order`: verify `custom_id` + amount vs server price; dedup on `paypal_order` |
| 2026-09-12 | Per-IP rate limits on PayPal / auth / webhook routes |
| 2026-09-12 | Deleted `.vercel` + `.env.vercel`; stripped Vercel-only keys from `.env.local`; chmod 600 env + opencode configs |

## Running the test battery

Python 3.9+ with `pytest` and `httpx`:

```sh
cd security-tests
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Against a local dev server (default):

```sh
# terminal 1
npm run dev                # next dev --webpack on :3000

# terminal 2
cd security-tests && pytest -v
```

Against a deployed environment:

```sh
BASE_URL=https://osakacastletours.com pytest -v
```

Optional env for specific suites:

| Env var | Purpose |
|---|---|
| `SUPABASE_ANON_KEY` | enable RLS/PII no-read check |
| `GYG_USERNAME` / `GYG_PASSWORD` | enable live GYG smoke |
| `PAYPAL_SANDBOX_CLIENT_ID/SECRET` | enable sandbox PayPal flow tests (localhost only) |
| `TEST_TOUR_ID` | override default tour UUID |

GYG tests run against the live site using the test credentials — same read-only surface the GYG
tester uses. Sandbox PayPal tests refuse to run against a non-localhost `BASE_URL`.