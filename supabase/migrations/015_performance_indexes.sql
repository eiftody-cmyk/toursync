-- Performance indexes for GYG self-testing tool response time optimization
-- Targets the most frequently queried columns in get-availabilities and reserve endpoints

-- tour_schedules: queried by tour_id + day_of_week + is_active
CREATE INDEX IF NOT EXISTS idx_tour_schedules_lookup ON tour_schedules (tour_id, day_of_week, is_active);

-- blocked_dates: queried by tour_id + date
CREATE INDEX IF NOT EXISTS idx_blocked_dates_lookup ON blocked_dates (tour_id, date);

-- bookings: queried by tour_id + date + status + start_time
CREATE INDEX IF NOT EXISTS idx_bookings_availability ON bookings (tour_id, date, status, start_time);

-- gyg_reservations: queried by tour_id + date + expires_at, and by gyg_booking_reference + expires_at
CREATE INDEX IF NOT EXISTS idx_gyg_reservations_availability ON gyg_reservations (tour_id, date, start_time, expires_at);
CREATE INDEX IF NOT EXISTS idx_gyg_reservations_booking_ref ON gyg_reservations (gyg_booking_reference, expires_at);

-- tour_pricing_categories: queried by tour_id
CREATE INDEX IF NOT EXISTS idx_tour_pricing_categories_tour ON tour_pricing_categories (tour_id);
