# ExperienceRelay — Project Status

## Objective
Build and refine ExperienceRelay, a tour management platform for small operators that syncs availability to Airbnb (via Google Calendar iCal), Viator, and GetYourGuide — with direct booking pages, PayPal integration, auto-blocking when full, and dashboard/stats. Platform is also for the user's own Osaka castle walking tour business.

## Important Details
- Project path: `/Users/edwardiftody/Osaka Castle Walks With Edward/toursync`
- GitHub repo: `https://github.com/eiftody-cmyk/toursync.git`
- Deployed at: `https://toursync1.vercel.app`
- Supabase project: `yxqhxmurckdjiulfdvpc`
- User: Edward Alexander Iftody, sole proprietor registered with Osaka City as "Osaka Castle Walks with Edward"
- User has ~5 Osaka castle walking tours, <10 bookings/month
- User is already a supplier on Airbnb, Viator, GYG, and Travelio
- Domain `experiencerelay.com` available — user likes "ExperienceRelay" brand
- Build command: `npx next build --webpack` (Turbopack not supported on darwin/arm64)
- `normalizeTime()` helper strips PostgreSQL `:00` seconds suffix — critical for time comparisons
- JPY currency handling: PayPal amounts must NOT be divided by 100 for JPY
- All Vercel env vars configured: Supabase, Google OAuth, PayPal (`PAYPAL_MODE=live`), `NEXT_PUBLIC_BASE_URL=https://toursync1.vercel.app`, `OTA_SYNC_ENABLED=true`
- PayPal webhook URL: `https://toursync1.vercel.app/api/webhooks/paypal` (ID: `69J39050YL719290M`)
- Email service: Resend (needs `RESEND_API_KEY` in Vercel + domain DNS)
- For `edward@osakacastletours.com` sending: Cloudflare only receives/forwards. Need Zoho Mail free tier for SMTP, or accept replies from Gmail
- `bookings@osakacastletours.com` recommended for automated emails via Resend API
- Travelio: only connects through Bokun, no direct API
- GYG: Applied to Integrator Portal as "Experiencerelay", completed 2FA, approved
- GYG Credentials received: Username `OsakaCastleWalkswithEdward`, password received (not shared)
- GYG Product IDs from Supplier Portal:
  - `T-1221780` → Osaka Castle Before Japan Had a Name
  - `T-1216886` → Osaka Castle A Lord, a Concubine, and a Shogun's Lie
  - `T-1218058` → Osaka Castle Warrior Monks, a Peasant, and a Shogun
  - `T-1216978` → Osaka Castle Photography After Dark
  - `T-1258476` → Osaka Castle Goddess, Queen, Empress, Concubine
- GYG API spec (v48): Product Reference Code (T-*) used as `productId` in API calls
- GYG API auth: HTTP Basic Auth. All responses return HTTP 200 with errors in JSON body
- GYG API SLA: 15s soft-limit, 27s hard-limit. Live A&P: <1.5s P95
- GYG requires all four product configurations as a Reservation System: Time Point + Individual, Time Point + Group, Time Period + Individual, Time Period + Group
- All 5 of Edward's tours are Time Point + Individual
- GYG Notify Availability Update URLs:
  - Sandbox (testing): `https://supplier-api.getyourguide.com/sandbox/1/notify-availability-update`
  - Production: `https://supplier-api.getyourguide.com/1/notify-availability-update`
- GYG Notify Availability tag says push notifications should ONLY be sent for:
  - Product goes to 0 vacancies (sold out / blocked)
  - Product becomes available (0 → >0)
  - High-demand product has <7 vacancies in next 60 days
  - NOT for decreased vacancies due to GYG bookings (GYG handles those)

## Work State

### Completed
- All earlier work through email service setup, notification bell, booking management
- GYG Supplier API integration fully implemented:
  - **Migration 010**: `gyg_reservations` table for 60-min holds — **RUN**
  - **Migration 011**: `tour_pricing_categories` table (ADULT, CHILD, etc.) — **RUN**
  - **Migration 012**: `cutoff_minutes` column on tours (default 60) — **RUN**
  - **Migration 013**: `product_type`, `ticket_type`, `group_size_min`, `group_size_max`, `opening_hours` columns on tours — **RUN**
  - **Migrations 001-009**: All run by user
- `src/lib/gyg/types.ts`: TypeScript types matching GYG OpenAPI spec
- `src/lib/gyg/auth.ts`: Basic Auth verification middleware (constant-time comparison)
- `src/lib/adapters/gyg.ts`: Updated to use Basic Auth (was Bearer token)
- `src/app/api/1/get-availabilities/route.ts`: GET endpoint — handles Time Point, Time Period, Individual, Group
- `src/app/api/1/reserve/route.ts`: POST — reservation holds with groupSize validation
- `src/app/api/1/cancel-reservation/route.ts`: POST — cancel reservation holds
- `src/app/api/1/book/route.ts`: POST — confirm booking, generate tickets, emails, notifications, auto-block
- `src/app/api/1/cancel-booking/route.ts`: POST — cancel booking with status checks
- `src/types/index.ts`: Updated Tour type with GYG fields, TourPricingCategory type
- `src/app/(app)/tours/ToursClient.tsx`: Added Pricing Categories editor, Cutoff field, Product Type selector, Ticket Type selector, Opening Hours inputs, Group Size min/max inputs
- Build passes cleanly
- `gyg-env-vars.md`: Vercel env vars documentation file
- `GRANT_FIX.md`: SQL fix for tour_channel_listings permission error
- **tour_channel_listings GRANT**: Fixed — user ran GRANT SQL successfully
- **GYG_NOTIFY_URL**: Set to sandbox in Vercel: `https://supplier-api.getyourguide.com/sandbox/1/notify-availability-update`

### Active
- **GYG_NOTIFY_URL** set in Vercel (sandbox)
- **GYG channel codes added** to all 5 tours in ExperienceRelay
- User needs to give GYG their testing URL: `https://toursync1.vercel.app/1/`
- User needs to test GYG endpoints using Integrator Portal testing tool

### Blocked
- **RESEND_API_KEY**: needs to be added to Vercel env vars after signing up at resend.com
- **Viator API keys**: need to apply for API access in Viator partner portal
- **Travelio**: no direct API — only Bokun integration exists

## Next Move
1. Give GYG testing URL: `https://toursync1.vercel.app/1/`
2. GYG tests the supplier endpoints (availability, reserve, book, cancel)
6. Register `experiencerelay.com` domain
7. Set up Zoho Mail for SMTP sending from `edward@osakacastletours.com`

## Relevant Files
- `src/lib/gyg/types.ts`: GYG API TypeScript types matching OpenAPI spec
- `src/lib/gyg/auth.ts`: Basic Auth verification middleware
- `src/lib/adapters/gyg.ts`: Outbound notify adapter (updated to Basic Auth)
- `src/app/api/1/get-availabilities/route.ts`: GYG availability endpoint
- `src/app/api/1/reserve/route.ts`: GYG reservation hold endpoint
- `src/app/api/1/cancel-reservation/route.ts`: GYG cancel reservation endpoint
- `src/app/api/1/book/route.ts`: GYG booking confirmation endpoint
- `src/app/api/1/cancel-booking/route.ts`: GYG booking cancellation endpoint
- `src/types/index.ts`: Updated Tour type with GYG fields, TourPricingCategory type
- `src/app/(app)/tours/ToursClient.tsx`: Tour edit UI with pricing categories, cutoff, product type, ticket type, opening hours, group size
- `supabase/migrations/010_gyg_reservations.sql`: GYG reservation holds table
- `supabase/migrations/011_tour_pricing_categories.sql`: Per-category pricing
- `supabase/migrations/012_tour_cutoff.sql`: cutoff_minutes column
- `supabase/migrations/013_product_types.sql`: product_type, ticket_type, group_size, opening_hours columns
- `supabase/migrations/005_tour_channel_listings.sql`: tour_channel_listings table for OTA product codes (needs GRANT fix)
- `supabase/migrations/008_add_booking_management.sql`: customer_email + status columns
- `supabase/migrations/009_notifications.sql`: notifications table with RLS
- `gyg-env-vars.md`: Vercel env vars documentation
- `src/lib/schedules/generateDates.ts`: Availability computation
- `src/lib/email/client.ts`: Resend client with lazy init
- `src/lib/email/booking-confirmation.ts`: Customer confirmation email template
- `src/lib/email/operator-notification.ts`: Operator notification email template
- `src/lib/adapters/viator.ts`: Viator push notification adapter
- `src/app/api/webhooks/paypal/route.ts`: PayPal webhook handler
