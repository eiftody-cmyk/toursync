# GYG Database Fix

Run this entire block in **Supabase SQL Editor** (Dashboard > SQL). Safe to re-run.

```sql
-- 1. ADD MISSING COLUMNS TO tours
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS product_type   text not null default 'time_point',
  ADD COLUMN IF NOT EXISTS ticket_type    text not null default 'individual',
  ADD COLUMN IF NOT EXISTS group_size_min int  not null default 1,
  ADD COLUMN IF NOT EXISTS group_size_max int  not null default 1,
  ADD COLUMN IF NOT EXISTS opening_hours  jsonb;

-- 2. GRANT TABLE PERMISSIONS
GRANT ALL ON public.tours                 TO service_role, authenticated;
GRANT ALL ON public.tour_schedules        TO service_role, authenticated;
GRANT ALL ON public.tour_channel_listings TO service_role, authenticated;
GRANT ALL ON public.tour_pricing_categories TO service_role, authenticated;
GRANT ALL ON public.schedule_exceptions   TO service_role, authenticated;
GRANT ALL ON public.bookings              TO service_role, authenticated;
GRANT ALL ON public.blocked_dates         TO service_role, authenticated;
GRANT ALL ON public.gyg_reservations      TO service_role, authenticated;
GRANT ALL ON public.notifications         TO service_role, authenticated;
GRANT ALL ON public.profiles              TO service_role, authenticated;

-- 3. SET PRODUCT TYPES FOR EACH GYG TOUR

-- Individual tours (time_point, ADULT/SENIOR, ¥9500)
UPDATE public.tours t
SET product_type   = 'time_point',
    ticket_type    = 'individual',
    group_size_min = 1,
    group_size_max = 1
WHERE t.id IN (
  SELECT tour_id FROM public.tour_channel_listings
  WHERE channel = 'gyg'
    AND external_product_code IN ('T-1221780','T-1216886','T-1218058','T-1216978')
);

-- Group tour (time_point, GROUP, ¥28000)
UPDATE public.tours t
SET product_type   = 'time_point',
    ticket_type    = 'group',
    group_size_min = 1,
    group_size_max = 10
WHERE t.id IN (
  SELECT tour_id FROM public.tour_channel_listings
  WHERE channel = 'gyg' AND external_product_code = 'T-1258476'
);

-- 4. RE-SEED PRICING CATEGORIES

DELETE FROM public.tour_pricing_categories
WHERE tour_id IN (
  SELECT tour_id FROM public.tour_channel_listings
  WHERE channel = 'gyg'
    AND external_product_code IN ('T-1221780','T-1216886','T-1218058','T-1216978')
);

INSERT INTO public.tour_pricing_categories (tour_id, category, price, currency)
SELECT tour_id, 'ADULT', 9500, 'JPY'
FROM public.tour_channel_listings
WHERE channel = 'gyg'
  AND external_product_code IN ('T-1221780','T-1216886','T-1218058','T-1216978')
ON CONFLICT (tour_id, category) DO UPDATE SET price = 9500, currency = 'JPY';

INSERT INTO public.tour_pricing_categories (tour_id, category, price, currency)
SELECT tour_id, 'SENIOR', 9500, 'JPY'
FROM public.tour_channel_listings
WHERE channel = 'gyg'
  AND external_product_code IN ('T-1221780','T-1216886','T-1218058','T-1216978')
ON CONFLICT (tour_id, category) DO UPDATE SET price = 9500, currency = 'JPY';

DELETE FROM public.tour_pricing_categories
WHERE tour_id IN (
  SELECT tour_id FROM public.tour_channel_listings
  WHERE channel = 'gyg' AND external_product_code = 'T-1258476'
);

INSERT INTO public.tour_pricing_categories (tour_id, category, price, currency)
SELECT tour_id, 'GROUP', 28000, 'JPY'
FROM public.tour_channel_listings
WHERE channel = 'gyg' AND external_product_code = 'T-1258476'
ON CONFLICT (tour_id, category) DO UPDATE SET price = 28000, currency = 'JPY';

-- 5. CLEAN UP EXPIRED RESERVATIONS
DELETE FROM public.gyg_reservations WHERE expires_at < now();

-- 6. ENSURE CAPACITY >= 6 (self-test needs at least 6 vacancies across 2 slots)
UPDATE public.tours
SET capacity = GREATEST(capacity, 6)
WHERE id IN (
  SELECT tour_id FROM public.tour_channel_listings WHERE channel = 'gyg'
);

-- 7. VERIFY: run these two queries to sanity-check

-- Tour state
SELECT
  tcl.external_product_code AS product_id,
  t.name,
  t.product_type,
  t.ticket_type,
  t.capacity,
  t.cutoff_minutes,
  t.group_size_min,
  t.group_size_max,
  t.currency,
  t.opening_hours,
  (SELECT jsonb_agg(jsonb_build_object('category', tpc.category, 'price', tpc.price))
   FROM public.tour_pricing_categories tpc WHERE tpc.tour_id = t.id) AS pricing
FROM public.tour_channel_listings tcl
JOIN public.tours t ON t.id = tcl.tour_id
WHERE tcl.channel = 'gyg' AND tcl.is_active = true
ORDER BY tcl.external_product_code;

-- Active schedules
SELECT
  tcl.external_product_code,
  ts.day_of_week,
  ts.start_time,
  ts.duration_minutes,
  ts.is_active
FROM public.tour_channel_listings tcl
JOIN public.tour_schedules ts ON ts.tour_id = tcl.tour_id
WHERE tcl.channel = 'gyg' AND ts.is_active = true
ORDER BY tcl.external_product_code, ts.day_of_week, ts.start_time;
```
