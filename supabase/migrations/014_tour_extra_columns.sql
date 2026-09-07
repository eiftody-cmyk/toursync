-- Add columns that were added manually via Supabase SQL editor
-- These are needed for tour_type, ticket_type, group sizing, and opening hours

alter table public.tours add column if not exists product_type text not null default 'time_point';
alter table public.tours add column if not exists ticket_type text not null default 'individual';
alter table public.tours add column if not exists group_size_min int;
alter table public.tours add column if not exists group_size_max int;
alter table public.tours add column if not exists opening_hours jsonb;

-- Enforce valid enum values
alter table public.tours add constraint tours_product_type_check
  check (product_type in ('time_point', 'time_period'));

alter table public.tours add constraint tours_ticket_type_check
  check (ticket_type in ('individual', 'group'));

-- Enforce group_size consistency
alter table public.tours add constraint tours_group_size_check
  check (
    (group_size_min is null and group_size_max is null)
    or (group_size_min is not null and group_size_max is not null and group_size_min >= 1 and group_size_min <= group_size_max)
  );
