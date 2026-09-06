# Fix: GRANT Permissions for GYG API Routes

## Problem

GYG API routes return `"Product not found"` for all 5 products despite data existing in the database. Root cause:

1. **Cookie-based Supabase client** (`createClient()`) was used for GYG routes — no session cookies when GYG calls → unauthenticated → RLS blocks queries.
2. **Service role client** (`createServiceClient()`) bypasses RLS but still requires **table-level GRANTs**. The `tours` table (and others) had no GRANT for `service_role`.

## Fix Applied

Created `src/lib/supabase/service.ts` — a service role client that bypasses RLS.

Updated all 5 GYG API routes to use `createServiceClient()` instead of `createClient()`:
- `src/app/api/1/get-availabilities/route.ts`
- `src/app/api/1/reserve/route.ts`
- `src/app/api/1/book/route.ts`
- `src/app/api/1/cancel-reservation/route.ts`
- `src/app/api/1/cancel-booking/route.ts`

Fixed array check bug: `.single()` returns a single object, not an array. Code was checking `Array.isArray(listing.tours)` which always failed.

## SQL to Run in Supabase Dashboard

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
GRANT ALL ON public.tours TO service_role, authenticated;
GRANT ALL ON public.tour_schedules TO service_role, authenticated;
GRANT ALL ON public.tour_channel_listings TO service_role, authenticated;
GRANT ALL ON public.bookings TO service_role, authenticated;
GRANT ALL ON public.blocked_dates TO service_role, authenticated;
GRANT ALL ON public.gyg_reservations TO service_role, authenticated;
GRANT ALL ON public.notifications TO service_role, authenticated;
GRANT ALL ON public.profiles TO service_role, authenticated;
```

## After Running

Test all 5 products:

```bash
for code in T-1221780 T-1216886 T-1218058 T-1216978 T-1258476; do
  curl -sL "https://toursync1.vercel.app/1/get-availabilities?productId=$code&fromDateTime=2026-09-06T00:00:00%2B09:00&toDateTime=2026-09-07T00:00:00%2B09:00" \
    -H "Authorization: Basic $(echo -n 'ExperienceRelay:P421105x#' | base64)"
done
```

Expected: Each response should return `{"data":{"availabilities":[...]}}` or `{"data":{"availabilities":[]}}` — NOT `"Product not found"`.
