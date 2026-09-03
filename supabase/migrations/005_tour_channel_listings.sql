-- Tour Channel Listings: manual OTA product codes per tour per channel
-- Supports Viator (5636104P*), GYG (T-*), Travelio (PRD-*), Airbnb (via Google Calendar)
-- Goddess = gyg+travelio+airbnb only (no Viator row = inactive)
-- Other tours: all 4 channels

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
