-- Airbnb-style "new guest cut-off": for a slot that already has a confirmed booking,
-- how many minutes before start additional guests may still join (0 = no cutoff).
-- Minimum allowed value is 60 minutes (matches Airbnb's absolute floor).
-- When null, availability falls back to cutoff_minutes.
alter table public.tours
  add column if not exists new_guest_cutoff_minutes integer;

-- Backfill: existing tours behave exactly as before until explicitly adjusted
update public.tours
  set new_guest_cutoff_minutes = cutoff_minutes
  where new_guest_cutoff_minutes is null;

comment on column public.tours.new_guest_cutoff_minutes is
  'Cut-off (minutes before start) for additional guests when some spots are already booked. 0 = no cutoff, minimum 60. Falls back to cutoff_minutes when null.';