-- Performance indexes for GYG self-testing tool
-- + Add gyg_booking_reference + reservation_reference columns to bookings for fast idempotency lookups

-- Index on tour_channel_listings for fast product lookup
CREATE INDEX IF NOT EXISTS idx_tour_channel_listings_product_lookup
  ON tour_channel_listings (external_product_code, channel, is_active);

-- Add dedicated columns for GYG references (replaces slow .like("notes", ...))
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS gyg_booking_reference text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reservation_reference text;

-- Index for fast idempotency checks
CREATE INDEX IF NOT EXISTS idx_bookings_gyg_booking_ref
  ON bookings (gyg_booking_reference)
  WHERE gyg_booking_reference IS NOT NULL;

-- Populate existing bookings from notes JSON
UPDATE bookings
SET gyg_booking_reference = (notes::jsonb->>'gyg_booking_ref'),
    reservation_reference = (notes::jsonb->>'reservation_ref')
WHERE source = 'gyg'
  AND gyg_booking_reference IS NULL
  AND notes IS NOT NULL;
