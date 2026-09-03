-- TourSync initial migration
-- Run in Supabase SQL editor or via supabase CLI

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Tours
create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  capacity int not null default 10 check (capacity > 0),
  price decimal(10,2),
  currency text default 'JPY',
  created_at timestamptz default now()
);

-- Bookings (manual entry, Option A quick entry)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  guest_count int not null default 1 check (guest_count > 0),
  source text,
  customer_name text,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_bookings_user_date on public.bookings(user_id, date);
create index if not exists idx_bookings_tour_date on public.bookings(tour_id, date);

-- Blocked dates (synced to Google Calendar)
create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references public.tours(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  start_time time,
  end_time time,
  reason text,
  google_calendar_event_id text,
  is_auto_blocked boolean default false,
  created_at timestamptz default now(),
  constraint blocked_unique_check unique (user_id, date, tour_id)
);
create index if not exists idx_blocked_user_date on public.blocked_dates(user_id, date);

-- Google Calendar tokens (tokens encrypted at app layer with GOOGLE_TOKEN_ENCRYPTION_KEY)
create table if not exists public.google_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  access_token text,
  refresh_token text,
  token_expiry timestamptz,
  calendar_id text default 'primary',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.tours enable row level security;
alter table public.bookings enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.google_tokens enable row level security;

-- RLS policies: users can only access their own rows
-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Tours
drop policy if exists "Users can manage own tours" on public.tours;
create policy "Users can manage own tours" on public.tours
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bookings
drop policy if exists "Users can manage own bookings" on public.bookings;
create policy "Users can manage own bookings" on public.bookings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Blocked dates
drop policy if exists "Users can manage own blocked_dates" on public.blocked_dates;
create policy "Users can manage own blocked_dates" on public.blocked_dates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Google tokens
drop policy if exists "Users can manage own google_tokens" on public.google_tokens;
create policy "Users can manage own google_tokens" on public.google_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
