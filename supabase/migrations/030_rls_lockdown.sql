-- RLS lockdown pass 030
-- 1) Revoke remaining public/anon access to gyg_reservations (024 only revoked authenticated)
-- 2) Fix education_inquiries policy from 028: USING(true) applies to ALL roles incl. anon
-- service_role bypasses RLS, so a TO service_role-only policy is the correct shape.

-- =============================================================================
-- 1. gyg_reservations — no client access
-- =============================================================================
REVOKE ALL ON public.gyg_reservations FROM anon;
REVOKE ALL ON public.gyg_reservations FROM authenticated;

-- Drop any lingering open policy
DROP POLICY IF EXISTS "Service role can manage gyg_reservations" ON public.gyg_reservations;

-- Explicit service-role-only policy (belt and suspenders; service_role also bypasses RLS)
CREATE POLICY "Service role can manage gyg_reservations"
  ON public.gyg_reservations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- 2. education_inquiries — replace 028's USING(true) open policy
-- =============================================================================
DROP POLICY IF EXISTS "Service role can manage education_inquiries" ON public.education_inquiries;

CREATE POLICY "Service role can manage education_inquiries"
  ON public.education_inquiries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.education_inquiries FROM anon;
REVOKE ALL ON public.education_inquiries FROM authenticated;
GRANT ALL ON public.education_inquiries TO service_role;
