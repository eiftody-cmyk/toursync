-- Tour Cutoff: configurable minutes before tour start for booking cutoff
-- Default 60 minutes (1 hour)

alter table public.tours add column if not exists cutoff_minutes int not null default 60;
