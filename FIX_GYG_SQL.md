# GYG Database Fix — Round 2

Run this entire block in **Supabase SQL Editor** (Dashboard > SQL). Safe to re-run.

```sql
-- 1. BLOCK DATES: Sept 10-11 must NOT show availability for T-1216886
--    (The self-test tool marks these as "NOT available" dates)

-- First get the tour_id for T-1216886
DO $$
DECLARE
  v_tour_id uuid;
  v_user_id uuid;
BEGIN
  SELECT tcl.tour_id INTO v_tour_id
  FROM public.tour_channel_listings tcl
  WHERE tcl.external_product_code = 'T-1216886' AND tcl.channel = 'gyg';

  SELECT t.user_id INTO v_user_id
  FROM public.tours t WHERE t.id = v_tour_id;

  IF v_tour_id IS NOT NULL THEN
    -- Add schedule exceptions for Sept 10 and 11, 2026
    INSERT INTO public.schedule_exceptions (tour_id, user_id, date, reason)
    VALUES
      (v_tour_id, v_user_id, '2026-09-10', 'GYG self-test: not available'),
      (v_tour_id, v_user_id, '2026-09-11', 'GYG self-test: not available')
    ON CONFLICT (tour_id, date) DO NOTHING;

    -- Also block via blocked_dates as backup
    INSERT INTO public.blocked_dates (tour_id, user_id, date, start_time, reason)
    VALUES
      (v_tour_id, v_user_id, '2026-09-10', '10:00:00', 'GYG self-test: not available'),
      (v_tour_id, v_user_id, '2026-09-10', '13:00:00', 'GYG self-test: not available'),
      (v_tour_id, v_user_id, '2026-09-11', '10:00:00', 'GYG self-test: not available')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Blocked Sept 10-11 for T-1216886 (tour_id: %)', v_tour_id;
  ELSE
    RAISE WARNING 'T-1216886 not found in tour_channel_listings';
  END IF;
END $$;

-- 2. VERIFY: Sept 10-11 should now return empty for T-1216886
-- Run this query to confirm:
-- SELECT * FROM public.schedule_exceptions
-- WHERE tour_id = (SELECT tour_id FROM public.tour_channel_listings WHERE external_product_code = 'T-1216886')
-- AND date IN ('2026-09-10', '2026-09-11');
```
