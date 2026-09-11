# Migration 020: Operator Settings

Run in Supabase Dashboard: https://supabase.com/dashboard/project/yxqhxmurckdjiulfdvpc/sql/new

```sql
-- Operator settings: per-platform commission rates
create table if not exists public.operator_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  commission_rates jsonb not null default '{
    "airbnb": 25,
    "viator": 20,
    "gyg": 25,
    "travelio": 20,
    "direct": 0,
    "walk_in": 0,
    "other": 0
  }'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: operators can only read/write their own settings
alter table public.operator_settings enable row level security;

create policy "Operators can view own settings"
  on public.operator_settings for select
  using (auth.uid() = user_id);

create policy "Operators can insert own settings"
  on public.operator_settings for insert
  with check (auth.uid() = user_id);

create policy "Operators can update own settings"
  on public.operator_settings for update
  using (auth.uid() = user_id);

-- Grants for service_role and authenticated
GRANT SELECT, INSERT, UPDATE ON public.operator_settings TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.operator_settings TO authenticated;
```
