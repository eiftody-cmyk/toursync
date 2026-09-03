-- Per-slot independence: same tour can have separate 10:00 and 13:00 blocks on the same date.
-- Old constraint was (user_id, date, tour_id) -> one row per tour per date.

-- 1. Remove old date-level constraint
alter table public.blocked_dates
  drop constraint if exists blocked_unique_check;

-- 2. Ensure per-slot rows are unique per tour+date+slot.
-- Use COALESCE so legacy NULL start_time counts as '00:00' consistently.
create unique index if not exists blocked_unique_per_slot
  on public.blocked_dates (
    user_id,
    tour_id,
    date,
    coalesce(start_time, time '00:00')
  );

-- 3. Fast per-slot lookups for calendar and auto-check queries.
create index if not exists idx_blocked_per_slot
  on public.blocked_dates (user_id, tour_id, date, start_time);
