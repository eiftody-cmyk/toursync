-- 017: Add reservations table and channel columns to bookings
-- This migration is non-destructive: creates new table, adds new columns
-- Does NOT modify or drop any existing data

-- 1. Create reservations table (generic, replaces gyg_reservations)
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('gyg', 'viator', 'direct')),
  channel_reservation_id TEXT,
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TEXT,
  booking_items JSONB NOT NULL DEFAULT '[]',
  total_guests INTEGER NOT NULL,
  total_price INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'JPY',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'converted', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for reservations
CREATE INDEX IF NOT EXISTS idx_reservations_tour_date_time ON reservations(tour_id, date, start_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status_expires ON reservations(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_reservations_channel_id ON reservations(channel, channel_reservation_id) WHERE channel_reservation_id IS NOT NULL;

-- 3. Extend bookings table with channel columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'direct';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS channel_booking_reference TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reservation_id UUID REFERENCES reservations(id);

-- 4. Index on new booking columns
CREATE INDEX IF NOT EXISTS idx_bookings_channel_ref ON bookings(channel, channel_booking_reference) WHERE channel_booking_reference IS NOT NULL;

-- 5. Enable RLS on reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies (service role can manage all)
CREATE POLICY "Service role can manage all reservations"
  ON reservations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Grant permissions
GRANT ALL ON reservations TO service_role;
GRANT SELECT ON reservations TO authenticated;
