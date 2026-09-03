# TourSync — Dashboard + Airbnb Calendar Sync (Phase 1 MVP)

Small tour operator tool: log in with Google, manage tours, track bookings per tour, block dates on a calendar, and sync those blocks to Airbnb via Google Calendar.

**This is a greenfield Next.js app** — sibling to the static `osaka-timeline/index.html:1` (GitHub Pages). It does not replace that site.

## Stack

- Next.js 16 App Router + TypeScript + Tailwind 4 + shadcn/ui (base-nova + @base-ui/react)
- Supabase Auth + Postgres (profiles, tours, bookings, blocked_dates, google_tokens) — see `supabase/migrations/001_initial.sql:1`
- Google Calendar API (`googleapis`) — OAuth with offline access, encrypted tokens, `transparency: opaque` busy blocks
- `react-big-calendar` + `date-fns` (JST `Asia/Tokyo` via `src/lib/time.ts`), `sonner` toasts

## Project Structure

```
toursync/
├── src/app/
│   ├── (marketing)/page.tsx       # Landing: "Block dates once. Sync everywhere."
│   ├── (auth)/login/page.tsx      # Google OAuth via Supabase (identity only)
│   ├── auth/callback/route.ts     # Supabase code exchange (CSRF-validated)
│   ├── (app)/proxy.ts             # Route protection (Next.js 16 Proxy)
│   ├── (app)/layout.tsx           # Protected layout + Sidebar
│   ├── (app)/dashboard/page.tsx   # Overview + capacity summary (JST today)
│   ├── (app)/calendar/page.tsx    # react-big-calendar (main feature)
│   ├── (app)/tours/page.tsx       # Tour CRUD (capacity 6)
│   ├── (app)/settings/page.tsx    # Google connect/disconnect
│   └── api/
│       ├── auth/google/*          # Google Calendar OAuth (separate from Supabase auth)
│       ├── calendar/block/unblock # Create/delete busy events
│       ├── bookings/auto-check    # Auto-block/unblock + race-safe upsert
│       └── health/route.ts        # GET /api/health
├── src/components/calendar/       # CalendarClient, BlockModal
├── src/components/bookings/       # BookingModal (Option A quick entry)
├── src/lib/supabase/              # client.ts, server.ts, middleware.ts
├── src/lib/google/                # auth.ts (AES-256-GCM), calendar.ts (JST)
├── src/lib/time.ts                # JST utilities (todayJST, toJSTStartOfDay, nextDay)
├── src/lib/capacity.ts            # capacity helpers
├── src/types/index.ts             # Tour, Booking, BlockedDate, BOOKING_SOURCES
└── supabase/migrations/
```

## Quick Start

```bash
# 0. Fix Node path (zsh) — already done on this Mac, persisted in ~/.zshrc:2
export PATH="$HOME/.local/node/bin:$PATH"
node -v && npm -v  # v22.16.0, 10.9.2

# 1. Env — copy .env.example -> .env.local and fill Supabase + Google creds
cp .env.example .env.local
# .env.local:1 — NEXT_PUBLIC_SUPABASE_URL etc. See .env.example for all vars

# 2. Install + run
npm install
npm run dev    # http://localhost:3000  (marketing at /, app at /dashboard)
npm run build  # verify — currently builds clean (18 routes, no warnings)
```

## Supabase Setup (Day 1-2)

1. Create Supabase project → enable Google OAuth provider (Auth → Providers).
2. Run migration `supabase/migrations/001_initial.sql:1` in SQL editor — creates 5 tables + RLS + `handle_new_user()` trigger.
3. Set `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` from Project Settings → API.
4. Create `google_tokens` encryption key: `openssl rand -hex 32` → `GOOGLE_TOKEN_ENCRYPTION_KEY`.

## Google Calendar Setup (Day 3-4)

1. Google Cloud Console → New project → Enable Calendar API → OAuth consent → Create OAuth client (Web) → redirect URI `http://localhost:3000/api/auth/google/callback`.
2. Set `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` in `.env.local`.
3. Flow: `/api/auth/google` → consent → `/api/auth/google/callback` → encrypt + upsert `google_tokens`. Refresh handled in `src/lib/google/calendar.ts:1` (`getValidAccessTokenWithClient`).

**Two OAuth flows — different purposes:**
- **Supabase Auth** (`/login` → `signInWithOAuth`): identity only (email + profile). Redirect: `supabase.co/auth/v1/callback` → `/auth/callback`.
- **Custom Google OAuth** (`/api/auth/google` → `/api/auth/google/callback`): Calendar API access only (`calendar.events` scope). Redirect: `/api/auth/google/callback` → stored encrypted in `google_tokens`.

## Key Behaviors

- **Capacity:** `capacity - sum(guest_count)` per tour+date. Booking insert → `POST /api/bookings/auto-check` → if `remaining <= 0` creates `blocked_dates(is_auto_blocked=true)` + Google event `FULL - [Tour Name]`. Delete → auto-unblock. Race-safe: handles `23505` unique constraint violation.
- **Blocking:** click date → modal auto-opens → `POST /api/calendar/block` → `google.calendar.events.insert` with `transparency: opaque` (busy). Unblock → delete event. Google pushes to Airbnb immediately — usually immediate, allow a minute for propagation.
- **Double-delete prevention:** `CalendarClient.handleUnblock` delegates to API; client-side DB delete only as fallback if API fails.
- **Timezone:** All dates JST (`Asia/Tokyo`). `src/lib/time.ts:1` provides `todayJST()`, `toJSTStartOfDay()`, `nextDay()`. Google Calendar API uses `timeZone: "Asia/Tokyo"`.
- **CSRF:** Both OAuth flows validate state cookies (HttpOnly + SameSite=Lax + Secure in prod). Auth callback allow-lists `next` param.
- **Token security:** AES-256-GCM encryption with 64-hex-char key validation. Disconnect revokes Google grant via `oauth2.googleapis.com/revoke`.
- **Tours:** seeded from `osaka-timeline/index.html:237` — 4 tours, ¥9500/¥28000, capacity 6.
- **Auth:** `src/proxy.ts:1` (Next.js 16 Proxy) protects `/dashboard,/calendar,/tours,/settings`; redirects to `/login`. Supabase SSR three-client pattern.

## What's NOT in Phase 1

Viator/GYG APIs, Travelio, billing, multi-tenant admin, mobile app.

## Deploy

Vercel → connect repo `toursync` → set env vars → deploy. Add production `GOOGLE_REDIRECT_URI` to Google Cloud Console.
