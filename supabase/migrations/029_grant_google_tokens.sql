-- Run this in Supabase Dashboard → SQL Editor, then run: npm run deploy

GRANT ALL ON public.google_tokens TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.google_tokens TO authenticated;
