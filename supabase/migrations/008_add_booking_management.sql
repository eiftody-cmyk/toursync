-- Add booking management fields
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status text DEFAULT 'confirmed';

-- Backfill customer_email from customer_name where it looks like an email
UPDATE public.bookings
SET customer_email = customer_name
WHERE customer_name LIKE '%@%'
  AND customer_email IS NULL;

-- Index for looking up bookings by email
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings (customer_email);
