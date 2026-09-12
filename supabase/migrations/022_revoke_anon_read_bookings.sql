-- Remove public read access to booking records (customer PII).
-- booking rows leak customer name/email/date to anyone holding the anon key.
--
-- Public pages that need booking counts (/book available-dates, create-order,
-- book/manage lookup) now query via the service role client server-side, so
-- the anon key no longer needs SELECT on bookings.
-- Schedule/exception/blocked-date anon reads (migration 019) are kept.

REVOKE SELECT ON public.bookings FROM anon;

drop policy if exists "Public can view bookings" on public.bookings;