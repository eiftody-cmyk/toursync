-- 031: Guest CRM (name-based) + customer country + access hardening
-- Run in Supabase SQL editor, then verify with the queries at the bottom.

-- =============================================================================
-- A. CRM columns
-- =============================================================================

-- Operator-written guest note (tips, preferences, "met at Sumiyoshi, wants
-- kokeshi recommendation"). Deliberately separate from bookings.notes, which
-- is machine metadata (GYG JSON / PayPal order refs) parsed by API routes.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guest_notes text;

-- ISO country code, scraped from PayPal payer.address.country_code only.
-- GYG / Viator / manual entries stay NULL (best-effort by design).
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_country text;

-- =============================================================================
-- B. Hardening
-- =============================================================================

-- 1) Bookings: drop every remaining anon privilege.
--    SELECT was already revoked in 022; INSERT/UPDATE/DELETE were only ever
--    blocked by RLS (policy requires auth.uid() = user_id). Public booking
--    pages query via the service role server-side, and browser clients run as
--    authenticated, so nothing legitimate uses the anon role on this table.
REVOKE ALL ON public.bookings FROM anon;

-- 2) Notifications: the insert policy from 009 had no TO clause, so it applied
--    to EVERY role (incl. anon) with WITH CHECK (true) — anyone holding the
--    public anon key could push arbitrary rows (phishing links) into the
--    operator's dashboard bell. All five insert sites in the app use the
--    service client; NotificationBell only SELECTs/UPDATEs as the signed-in
--    user, so restricting insert to service_role breaks nothing.
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT TO service_role
  WITH CHECK (true);

REVOKE INSERT ON public.notifications FROM anon;
REVOKE INSERT ON public.notifications FROM authenticated;

-- =============================================================================
-- Verification (run after applying)
-- =============================================================================
-- \dp public.bookings           -- anon should have NO entries
-- \dp public.notifications      -- anon/authenticated should have no INSERT
-- SELECT policyname, roles, cmd FROM pg_policies
--   WHERE tablename = 'notifications';
--   -- insert policy roles should be {service_role}
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'bookings' AND column_name IN ('guest_notes','customer_country');
