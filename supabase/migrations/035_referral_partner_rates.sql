-- 035: Per-partner referral payout rates (/ref/join partners)
-- Run in Supabase SQL editor, then verify with the queries at the bottom.
--
-- Payouts for /ref/join referrals change from a flat ¥1,500/guest to a
-- percentage of booking value (tour price x guests), unique per partner.
-- The partner registry itself stays code-controlled (/config/referral-
-- partners); this table only carries the money rate for slugs that already
-- exist there — a client can never mint a partner or its rate.
--
-- Rates are edited manually (Supabase table editor / UPDATE below).
-- Dashboard code falls back to 10% until this migration is applied.

create table if not exists public.referral_partners (
  slug text primary key,
  payout_rate numeric not null default 10
    check (payout_rate >= 0 and payout_rate <= 100),
  created_at timestamptz not null default now()
);

-- Seed current /ref/join partners at 10%. Existing rows are left alone so a
-- manually adjusted rate survives a re-run of this migration.
insert into public.referral_partners (slug, payout_rate) values
  ('misaki', 10),
  ('ryuterhua', 10),
  ('hotelnoum', 10)
on conflict (slug) do nothing;

alter table public.referral_partners enable row level security;

create policy "Authenticated can read referral partner rates"
  on public.referral_partners
  for select
  to authenticated
  using (true);

-- Explicit grants (Supabase no longer auto-grants new public tables).
-- Rates are internal: no anon grant.
grant select on public.referral_partners to authenticated;
grant select, insert, update, delete on public.referral_partners to service_role;

-- Verify:
--   select slug, payout_rate from public.referral_partners order by slug;
--   -- expect misaki / hotelnoum / ryuterhua at 10 (or your manual rate)
--
--   -- Example payout at the stored rate (partner-attributed, confirmed):
--   select rs.display_name,
--          rs.partner,
--          coalesce(sum(b.guest_count), 0)                 as guests,
--          coalesce(sum(round((t.price * b.guest_count)
--                   * rp.payout_rate / 100)), 0)           as payout_yen
--     from public.referral_staff rs
--     left join public.referral_partners rp on rp.slug = rs.partner
--     left join public.bookings b
--            on b.source = rs.partner
--           and b.referrer_staff = rs.slug
--           and b.status = 'confirmed'
--     left join public.tours t on t.id = b.tour_id
--    group by rs.id
--    order by payout_yen desc;
--
--   -- Change one partner's rate later:
--   -- update public.referral_partners set payout_rate = 12.5 where slug = 'misaki';
