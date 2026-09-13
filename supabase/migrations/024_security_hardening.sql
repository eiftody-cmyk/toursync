-- Security hardening migration

-- 1. Add paypal_order_id column for authoritative dedup
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paypal_order_id text;

-- 2. Unique index: one booking per PayPal order
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_paypal_order_id
  ON public.bookings (paypal_order_id)
  WHERE paypal_order_id IS NOT NULL;

-- 3. Backfill from standard notes format: "PayPal order: <id>"
UPDATE public.bookings
SET paypal_order_id = regexp_replace(notes, '.*PayPal order: ([^"]+).*', '\1')
WHERE notes LIKE '%PayPal order:%' AND paypal_order_id IS NULL;

-- 4. Backfill from JSON notes: {"paypal_order": "..."}
UPDATE public.bookings
SET paypal_order_id = (notes::jsonb ->> 'paypal_order')
WHERE notes LIKE '{%' AND notes LIKE '%paypal_order%' AND paypal_order_id IS NULL;

-- 5. REVOKE authenticated access to gyg_reservations
-- All callers use createServiceClient() (service_role, bypasses RLS).
-- No frontend or authenticated-user code path accesses this table.
REVOKE ALL ON public.gyg_reservations FROM authenticated;
