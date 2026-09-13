-- 025: Add paypal_capture_id for refunds, add bookings to Realtime publication

-- Store capture ID for PayPal refund capability
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paypal_capture_id text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_paypal_capture_id
  ON public.bookings (paypal_capture_id)
  WHERE paypal_capture_id IS NOT NULL;

-- Add bookings table to Realtime publication so CalendarClient refreshes on changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
