-- 032: MISAKI referral attribution
-- Run in Supabase SQL editor, then verify with the queries at the bottom.

-- Staff member at KIMONO RENTAL MISAKI who referred the booking.
-- Paired with source = 'misaki' (existing bookings.source column), which is
-- what the dashboard filter and revenue calculations key off.
-- Booking rows keep: tour_id, date, guest_count → commission = 1500 × guests.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS referrer_staff text;

-- Source lookup for "bookings by staff member" / MISAKI reporting queries.
CREATE INDEX IF NOT EXISTS idx_bookings_source ON public.bookings (source);

-- Verify:
--   select column_name from information_schema.columns
--    where table_schema = 'public' and table_name = 'bookings'
--      and column_name = 'referrer_staff';
--
-- MISAKI commission report:
--   select referrer_staff,
--          count(*)                        filter (where status = 'confirmed') as bookings,
--          sum(guest_count)                filter (where status = 'confirmed') as guests,
--          sum(guest_count) * 1500         filter (where status = 'confirmed') as commission_yen
--     from public.bookings
--    where source = 'misaki'
--    group by referrer_staff;
