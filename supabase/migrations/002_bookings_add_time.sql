-- Add start_time/end_time to bookings for distinguishing tour time slots
alter table public.bookings add column if not exists start_time time;
alter table public.bookings add column if not exists end_time time;

-- Update the unique index to include time (allows same tour+date with different times)
drop index if exists idx_bookings_tour_date;
create index if not exists idx_bookings_tour_date_time on public.bookings(tour_id, date, start_time);
