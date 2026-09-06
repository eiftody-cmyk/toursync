-- Tour Pricing Categories: per-category pricing for tours
-- Supports ADULT, CHILD, SENIOR, etc. pricing tiers
-- If no categories exist, tours.price is used as the single ADULT price

create table if not exists public.tour_pricing_categories (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  category text not null check (category in (
    'ADULT','CHILD','YOUTH','INFANT','SENIOR','STUDENT',
    'EU_CITIZEN','MILITARY','EU_CITIZEN_STUDENT','GROUP'
  )),
  price integer not null check (price >= 0),
  currency text not null default 'JPY',
  created_at timestamptz default now(),
  constraint uq_tour_category unique (tour_id, category)
);

create index if not exists idx_tpc_tour on public.tour_pricing_categories(tour_id);

alter table public.tour_pricing_categories enable row level security;

drop policy if exists "Users can manage own pricing categories" on public.tour_pricing_categories;
create policy "Users can manage own pricing categories" on public.tour_pricing_categories
  for all using (auth.uid() = (
    select user_id from public.tours where id = tour_id
  )) with check (auth.uid() = (
    select user_id from public.tours where id = tour_id
  ));

-- Auto-create ADULT category for existing tours that have a price
insert into public.tour_pricing_categories (tour_id, category, price, currency)
select id, 'ADULT', price::int, currency
from public.tours
where price is not null and price > 0
  and not exists (
    select 1 from public.tour_pricing_categories tpc where tpc.tour_id = tours.id
  );
