-- Migration 002-005 combined: Add missing columns and tables
-- Run this in Supabase SQL Editor

-- 002: Add start_time/end_time to bookings
alter table public.bookings add column if not exists start_time time;
alter table public.bookings add column if not exists end_time time;
drop index if exists idx_bookings_tour_date;
create index if not exists idx_bookings_tour_date_time on public.bookings(tour_id, date, start_time);

-- 003: Per-tour Google Calendars
alter table public.tours add column if not exists google_calendar_id text;
update public.tours t
set google_calendar_id = gt.calendar_id
from public.google_tokens gt
where t.user_id = gt.user_id
  and t.google_calendar_id is null;
alter table public.blocked_dates add column if not exists calendar_id text;

-- 004: Per-slot uniqueness
alter table public.blocked_dates
  drop constraint if exists blocked_unique_check;
create unique index if not exists blocked_unique_per_slot
  on public.blocked_dates (
    user_id,
    tour_id,
    date,
    coalesce(start_time, time '00:00')
  );
create index if not exists idx_blocked_per_slot
  on public.blocked_dates (user_id, tour_id, date, start_time);

-- 005: Tour Channel Listings
create table if not exists public.tour_channel_listings (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  channel text not null check (channel in ('viator','gyg','travelio','airbnb')),
  external_product_code text not null,
  supplier_code text,
  listing_url text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint uq_tour_channel unique (tour_id, channel)
);
create index if not exists idx_tcl_tour on public.tour_channel_listings(tour_id);
create index if not exists idx_tcl_user_channel on public.tour_channel_listings(user_id, channel);
create index if not exists idx_tcl_code on public.tour_channel_listings(external_product_code);
alter table public.tour_channel_listings enable row level security;
drop policy if exists "Users can manage own channel listings" on public.tour_channel_listings;
create policy "Users can manage own channel listings" on public.tour_channel_listings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
