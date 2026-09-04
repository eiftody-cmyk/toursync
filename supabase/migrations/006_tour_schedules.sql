-- Tour schedules: define when tours run (recurring weekly pattern)
-- Instead of blocking unavailable dates, operators set when tours ARE available.

create table if not exists public.tour_schedules (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sun, 6=Sat
  start_time time not null,
  duration_minutes int not null default 150,
  start_date date not null,
  end_date date,
  is_active boolean default true,
  created_at timestamptz default now(),
  constraint unique_schedule unique (tour_id, day_of_week, start_time)
);

create index if not exists idx_tour_schedules_tour on public.tour_schedules(tour_id);
create index if not exists idx_tour_schedules_user on public.tour_schedules(user_id);

-- Schedule exceptions: dates to skip (holidays, cancellations)
create table if not exists public.schedule_exceptions (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz default now(),
  constraint unique_exception unique (tour_id, date)
);

create index if not exists idx_schedule_exceptions_tour on public.schedule_exceptions(tour_id);

-- Enable RLS
alter table public.tour_schedules enable row level security;
alter table public.schedule_exceptions enable row level security;

-- RLS policies
drop policy if exists "Users can manage own tour_schedules" on public.tour_schedules;
create policy "Users can manage own tour_schedules" on public.tour_schedules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own schedule_exceptions" on public.schedule_exceptions;
create policy "Users can manage own schedule_exceptions" on public.schedule_exceptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
