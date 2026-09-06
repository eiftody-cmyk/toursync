-- GYG Reservations: hold table for 1-hour reservation expiry
-- GYG requires inventory to be held for at least 15 minutes (recommended 60 minutes)

create table if not exists public.gyg_reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_reference text not null unique,
  gyg_booking_reference text not null,
  tour_id uuid not null references public.tours(id) on delete cascade,
  date date not null,
  start_time text,
  product_id text not null,
  booking_items jsonb not null default '[]'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists idx_gyg_res_reference on public.gyg_reservations(reservation_reference);
create index if not exists idx_gyg_res_tour_date on public.gyg_reservations(tour_id, date);
create index if not exists idx_gyg_res_expires on public.gyg_reservations(expires_at);

alter table public.gyg_reservations enable row level security;

-- Service role can manage all reservations (API routes use service role)
drop policy if exists "Service role can manage gyg_reservations" on public.gyg_reservations;
create policy "Service role can manage gyg_reservations" on public.gyg_reservations
  for all using (true) with check (true);
