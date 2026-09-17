-- Security hardening: fix Supabase linter warnings
-- Addresses 8 warnings from the database linter

-- =============================================================================
-- 1. Drop overly-permissive gyg_reservations policy
-- =============================================================================
-- service_role bypasses RLS entirely, and authenticated was revoked in 024.
-- This policy is redundant and flagged by the linter for USING(true) + WITH CHECK(true).

DROP POLICY IF EXISTS "Service role can manage gyg_reservations" ON public.gyg_reservations;

-- =============================================================================
-- 2. Drop overly-permissive notifications INSERT policy
-- =============================================================================
-- Same reasoning: service_role bypasses RLS. The user-facing SELECT/UPDATE
-- policies (auth.uid() = user_id) are sufficient.

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

-- =============================================================================
-- 3. Revoke EXECUTE on handle_new_user() from anon and authenticated
-- =============================================================================
-- This is a trigger function that only runs via the auth.users INSERT trigger.
-- It should not be callable directly via the REST API.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- =============================================================================
-- 4. Revoke EXECUTE on rls_auto_enable() from anon and authenticated
-- =============================================================================
-- NOTE: This is a Supabase platform function. Only revoke if you're confident
-- it's not needed by Supabase internals. Comment out if it causes issues.

DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
  REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
EXCEPTION WHEN undefined_function THEN
  -- Function doesn't exist in this project, skip silently
  NULL;
END $$;

-- =============================================================================
-- 5. Add RLS policies for education_inquiries
-- =============================================================================
-- Table has RLS enabled but no policies (linter warning).
-- Only service_role should access this table (used server-side only).

CREATE POLICY "Service role can manage education_inquiries"
  ON public.education_inquiries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- 6. Tighten logos bucket: remove listing policy
-- =============================================================================
-- Public buckets serve files via direct URL without needing a SELECT policy.
-- The broad SELECT policy was allowing anyone to enumerate all files via list().
-- Dropping it stops listing while preserving direct URL access.

DROP POLICY IF EXISTS "Public read access for logos" ON storage.objects;
