# ExperienceRelay — Project Status

## Objective
- Build and maintain ExperienceRelay, a tour management platform for small operators that syncs availability to Viator, GetYourGuide (GYG), and Travelio — with direct booking via PayPal, auto-blocking, and dashboard/stats.
- Booking pages on toursync must match osakacastletours.com design and offer the same payment options as the PayPal NCP page (PayPal + Credit/Debit Card + Pay Later + Venmo), embedded directly on the page — no redirect to PayPal login.

## Important Details
- Project path: `/Users/edwardiftody/Osaka Castle Walks With Edward/toursync`
- Website repo: `/Users/edwardiftody/Osaka Castle Walks With Edward/osaka-timeline` (static HTML, GitHub Pages)
- GitHub repo: `https://github.com/eiftody-cmyk/toursync.git`
- Cloudflare Worker: `https://toursync.eiftody.workers.dev` (production)
- Supabase project: `yxqhxmurckdjiulfdvpc`
- Domain: `osakacastletours.com` — marketing site on GitHub Pages, booking/app on Cloudflare Workers
- Cloudflare routes: `/_next/*`, `/book/*`, `/api/*` → toursync Worker; `/` → GitHub Pages
- Build: `npx opennextjs-cloudflare build && npx wrangler deploy`
- User: Edward Alexander Iftody, sole proprietor registered with Osaka City as "Osaka Castle Walks with Edward"
- User has ~5 Osaka castle walking tours, <10 bookings/month
- User is already a supplier on Airbnb, Viator, GYG, and Travelio
- Domain `experiencerelay.com` available — user likes "ExperienceRelay" brand
- JPY currency handling: PayPal amounts must NOT be divided by 100 for JPY
- GYG outbound credentials: `GYG_USERNAME=OsakaCastleWalkswithEdward`, `GYG_PASSWORD=64a96de598f01c5b29e9f1266b7e53dc`
- GYG inbound (test): `GYG_INBOUND_USERNAME=ExperienceRelay`, `GYG_INBOUND_PASSWORD=P421105x`
- GYG inbound (production): `GYG_PROD_USERNAME=ExperienceRelay1`, `GYG_PROD_PASSWORD=P421105x`
- Auth middleware accepts both test and production GYG credential sets
- `NEXT_PUBLIC_BASE_URL`: `https://osakacastletours.com`
- Supabase anon key: in `wrangler.toml` `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase service role key: in `.env.local` `SUPABASE_SERVICE_ROLE_KEY`
- osakacastletours.com theme: dark ink/gold/parchment, Cormorant Garamond + Cinzel fonts, CSS variables: `--gold: #c8a96e`, `--ink: #0e0c09`, `--parchment: #f5efe3`, `--stone: #1a1510`
- **Database tour names (include "Osaka Castle:" prefix):**
  - `Osaka Castle: Before Japan Had a Name` (ID: `6b3bc718-9754-4ed8-8746-040e1ccbb6de`)
  - `Osaka Castle: Warrior Monks, a Peasant, and a Shogun` (ID: `c97d74f3-c95a-451f-aa1a-e34452b3e592`)
  - `Osaka Castle: A Lord, a Concubine, and a Shogun's Lie` (ID: `698d3a9f-404d-418e-a323-c21450d91169`)
  - `Osaka Castle Goddess, Queen, Empress, Concubine` (ID: `fda04737-d6b8-49d5-a2d1-573628bba088`) — note: no colon after "Castle"
  - `Osaka Castle: Photography after dark` (ID: `1c2535d2-a946-4da6-ad35-5df42339323e`)
- PayPal NCP links being replaced: `GHZP2YXU68YFC` (Goddess), `64M6J2UHA6VFJ` (Before Japan), `8E5GZYVDYUQB2` (Warrior Monks), `WE89HS4Y23KW2` (Lord/Concubine)
- PayPal client ID is passed server-side via `process.env.PAYPAL_CLIENT_ID` → props to client components (no public env var needed)
- PayPal brand_name in API: `"Osaka Castle Walks with Edward"`
- Custom bookings use `source='direct-custom'` — Edward confirms manually, no auto-block
- Custom booking custom_id format (simplified): `tour_id|date|start_time|guest_count|custom=true|customer_phone` — name/email now come from PayPal payer object, not encoded
- Viator Supplier ID: `5636104`
- Viator auth: `X-Api-Key` header (v2.0+)
- Blocked dates: All-day blocks (`start_time = NULL`) correctly handled via `allDayBlockedDates` Set in `generateDates.ts` and GYG availability route
- Custom booking form: no name/email fields (PayPal collects), phone optional, time dropdown 9am-3pm in 15-min intervals
- Booking page header layout: left="Osaka Castle Walks with Edward" text, center=logo (240px desktop, 80px mobile), right="History Beyond the Postcard" tagline. Logo is not clickable.
- Mobile breakpoint: `max-width: 768px` — tagline hidden, logo 80px, reduced padding
- `@paypal/react-paypal-js` installed — renders PayPal + Credit/Debit Card + Pay Later + Venmo buttons directly on page
- **PayPal mode: LIVE** — real money, deposits to linked bank account
- **Resend email**: FROM `noreply@osakacastletours.com` (verified domain), API key in Cloudflare secrets
- **Cancel policy**: 24 hours before tour start — customers can cancel via `/book/manage`
- **Manage page**: `/book/manage?id={bookingId}` (single booking) or `/book/manage?email={email}` (all bookings)

## Work State
### Completed
- **Cloudflare migration complete**: Vercel → Cloudflare Workers via `@opennextjs/cloudflare`
- **GYG self-testing all 4 categories PASSED**
- **GYG production testing all 4 categories PASSED (47/47)**
- **GYG notify availability test complete**: Email sent (ticket #21468869)
- **GYG live testing submitted** — Status: "In Progress", waiting for Project Manager
- **Viator API spec analyzed** — `viator-api-spec.md`, `viator-api-request.md`
- **Phase 1: Core Reservation Engine** built and deployed
- **Phase 3: Viator Adapter** built and deployed (7 API routes)
- **Migration 017** (reservations table) run successfully
- **Migration 018** — `GRANT SELECT ON public.tours TO anon` + RLS policy — run manually
- **Migration 019** — `GRANT SELECT` + RLS policies for `tour_schedules`, `schedule_exceptions`, `blocked_dates`, `bookings` — run manually
- **PayPal JS SDK integration complete** — `@paypal/react-paypal-js` renders embedded payment buttons (PayPal + Card + Pay Later + Venmo) on booking pages, no redirect
- **PayPal LIVE mode** — Real payments working (Visa/Mastercard/PayPal), deposits to linked bank account
- **`/api/paypal/capture-order` route created** — captures payment, creates booking, sends emails, handles both instant and custom bookings
- **Booking pages fully restyled** — Dark ink/gold/parchment theme, Cinzel/Cormorant Garamond fonts, "Osaka Castle Walks with Edward" branding
- **Custom calendar grid built** — Full month view with colored dates (gold=available, red=blocked/full), spots remaining shown, visible on page load
- **Cutoff time enforcement** — `generateDates.ts` filters today's past-cutoff slots; `create-order/route.ts` validates cutoff before creating order
- **Custom booking time dropdown** — 15-minute intervals from 09:00 to 15:00
- **Name/email removed from custom form** — PayPal collects automatically; `PayPalPayment.tsx` uses `actions.order.get()` payer info
- **All-day block bug fixed** — `generateDates.ts` now has `allDayBlockedDates` Set; GYG route's time_period section already handled this
- **Verified blocked dates appear in booking calendar** — Before Japan, Warrior Monks, Lord/Concubine all show blocked Sept 9, 10, 11
- **GYG configuration verified intact** — All 4 products responding, auth working, no files modified in GYG routes
- **Landing pages centered "Need a Different Time?" content** — All 4 pages updated with `display: flex; flex-direction: column; justify-content: center;` on `.booking-option`
- **Logo added to booking pages** — `logo.webp` copied to `public/`, displayed at 240px on desktop, 80px on mobile
- **Header layout** — Three-column: left text, center logo, right tagline "History Beyond the Postcard"
- **Logo link disabled** — Changed from `<Link href="/">` to `<div>` so clicking logo does nothing
- **Mobile responsive** — Media query at 768px: logo 80px, tagline hidden, reduced padding
- **Footer updated** — Replaced ExperienceRelay link with contact info: address + email
- **Tagline font size** — Updated to match logo text (1rem)
- **Hero tagline** — Changed colon to em dash
- **All repos committed and pushed** — toursync (`1b3bb6d`), osaka-timeline (`ab39a88`)
- **Resend email integration** — Booking confirmation, cancellation confirmation, operator notification emails working
- **Manage/cancel booking flow** — `/book/manage` page with cancel button, 24-hour policy, success/error messages
- **Cloudflare routing** — `/_next/*` (CSS/JS), `/book/*` (booking pages), `/api/*` (API endpoints) route to Worker
- **`NEXT_PUBLIC_BASE_URL` updated** — Changed from `toursync.eiftody.workers.dev` to `osakacastletours.com`
- **Cancellation confirmation email** — Sent to customer when they cancel, includes rebook link
- **Booking confirmation email** — Includes "Manage Booking" link to cancel up to 24h before tour
- **Time format fixed** — No seconds in emails (10:00 not 10:00:00)
- **Cancel API fixed** — Uses service client to bypass RLS, allows anonymous users to cancel their bookings
- **Calendar excludes cancelled bookings** — Server + client queries filter `status=confirmed`; capacity calculation only counts confirmed bookings
- **Auto-check excludes cancelled bookings** — Capacity check for auto-blocking only counts confirmed bookings
- **Cancel API unblocks calendar** — Directly deletes `blocked_dates` row (was broken: called nonexistent API endpoint with wrong params)

### Active
- (none)

### Blocked
- **Viator API key** — Follow-up email sent (Sept 10). Waiting for Supply API credentials from supplierapi@viator.com
- **GYG live testing** — Testing PASSED (47/47). Contacted customer service; technical team expected to reach out next week to finalize
- **4 tours in live testing config** — Must not be changed until GYG live testing complete

## Next Move
1. GYG — Wait for technical team contact next week, finalize integration
2. Viator — When API key arrives → set secret → test endpoints
3. Calendar auto-check — verify auto-block/unblock works correctly with confirmed-only filter

## Relevant Files
- `src/app/book/BookingPageClient.tsx`: Instant book page — restyled, PayPal SDK, calendar grid, logo, non-clickable logo
- `src/app/book/custom/CustomBookingClient.tsx`: Custom time booking form — restyled, PayPal SDK, no name/email, time dropdown, logo
- `src/app/book/styles.css`: Shared booking styles — calendar grid, header layout, mobile responsive, all theme styles
- `src/app/book/page.tsx`: Instant book page (server) — passes `paypalClientId` to client
- `src/app/book/custom/page.tsx`: Custom time page (server) — passes `paypalClientId` to client
- `src/app/book/manage/page.tsx`: Manage/cancel booking page — queries bookings + tours separately (RLS fix), cancel button
- `src/components/PayPalPayment.tsx`: PayPal SDK wrapper — renders buttons, handles createOrder + onApprove with payer info
- `src/app/api/paypal/create-order/route.ts`: Instant book order creation — includes cutoff validation
- `src/app/api/paypal/create-custom-order/route.ts`: Custom time order creation — simplified custom_id (no name/email)
- `src/app/api/paypal/capture-order/route.ts`: Captures payment, creates booking, sends emails — uses PayPal payer info
- `src/app/api/webhooks/paypal/route.ts`: PayPal webhook — handles both instant + custom, uses PayPal payer info
- `src/app/api/bookings/cancel/route.ts`: Cancel API — service client bypasses RLS, 24h policy, sends cancellation email
- `src/lib/schedules/generateDates.ts`: Generates available dates — all-day block support, cutoff filtering
- `src/lib/paypal/client.ts`: PayPal API client — brand_name = "Osaka Castle Walks with Edward"
- `src/lib/supabase/service.ts`: Supabase service role client (bypasses RLS) — used by cancel API
- `public/logo.webp`: Osaka Castle logo (copied from osaka-timeline)
- `src/lib/email/client.ts`: Resend email client — FROM `noreply@osakacastletours.com`, returns `{ ok, id, error }`
- `src/lib/email/booking-confirmation.ts`: Booking confirmation email — includes "Manage Booking" link, no seconds in time
- `src/lib/email/operator-notification.ts`: Operator notification email — includes customer name + email
- `src/lib/email/cancellation-confirmation.ts`: Cancellation confirmation email — includes rebook link
- `src/lib/email/custom-time-notification.ts`: Custom time email template for Edward
- `wrangler.toml`: Cloudflare config — routes `/_next/*`, `/book/*`, `/api/*` to Worker
- `notes/experiencerelay-launch-todos.md`: Pre-launch checklist for ExperienceRelay
- `notes/personalized-from-address.md`: Option A per-operator Resend setup guide
- `notes/apple-pay-google-pay-setup.md`: Future Apple Pay/Google Pay setup instructions
- `osaka-timeline/index.html`: Landing page — hero tagline updated (colon to em dash)
- `viator-api-spec.md`: Viator API specification and integration plan
- `viator-api-request.md`: Draft email for Viator API access request
- `gyg-live-test.md`: GYG live testing product configuration
