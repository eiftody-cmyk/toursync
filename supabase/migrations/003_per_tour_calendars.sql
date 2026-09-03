-- Per-tour Google Calendars: each tour can have its own Google Calendar
-- so Airbnb blocks are per-tour (not global). Enables:
--   - Sick single tour: block Goddess 10→15 only (other tours live)
--   - Typhoon all tours: block All 10→15 (each tour gets its own busy event)

alter table public.tours add column if not exists google_calendar_id text;

-- Backfill: set existing tours' calendar to primary (from google_tokens)
update public.tours t
set google_calendar_id = gt.calendar_id
from public.google_tokens gt
where t.user_id = gt.user_id
  and t.google_calendar_id is null;

-- Add calendar_id to blocked_dates so unblock knows which calendar to delete from
-- (stored per-event, not per-tour, for flexibility with manual blocks)
alter table public.blocked_dates add column if not exists calendar_id text;
