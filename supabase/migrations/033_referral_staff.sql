-- 033: Referral staff identities (staff self-registered via /ref/join)
-- Run in Supabase SQL editor, then verify with the queries at the bottom.
--
-- One row per registered referrer. The (partner, slug) pair is the stable
-- payout identity: bookings.referrer_staff stores this slug when the guest
-- arrives via /ref/<partner>-<slug>; the partner-QR typed fallback stores
-- free text instead (matched manually in the report).
--
-- contact is required at join but deliberately NOT unique: it is an identity
-- aid for rejoin recovery (partner + lower(contact)), not authentication.
-- Two rows may theoretically share a contact; the slug remains the identity.

create table if not exists public.referral_staff (
  id uuid primary key default gen_random_uuid(),
  partner text not null,
  slug text not null,
  display_name text not null,
  contact text not null,
  created_at timestamptz not null default now()
);

-- The only hard identity constraint.
create unique index if not exists uq_referral_staff_slug
  on public.referral_staff (partner, slug);

-- Report lookups: bookings grouped by staff within a partner.
create index if not exists idx_referral_staff_partner
  on public.referral_staff (partner);

alter table public.referral_staff enable row level security;

create policy "Authenticated can read referral staff"
  on public.referral_staff
  for select
  to authenticated
  using (true);

-- Landing + join routes use the service client (contacts are never exposed
-- through the public anon role). Dashboard reads as authenticated.
grant select, insert, update on public.referral_staff to service_role;
grant select on public.referral_staff to authenticated;

-- Verify:
--   select column_name from information_schema.columns
--    where table_schema = 'public' and table_name = 'referral_staff'
--    order by ordinal_position;
--
--   select count(*) from public.referral_staff;   -- 0 before first join
--
--   -- Payout report (slug-based):
--   select rs.display_name, rs.partner, rs.contact,
--          count(b.id)                                    as bookings,
--          coalesce(sum(b.guest_count), 0)                as guests,
--          coalesce(sum(b.guest_count), 0) * 1500         as commission_yen
--     from public.referral_staff rs
--     left join public.bookings b
--            on b.source = rs.partner
--           and b.referrer_staff = rs.slug
--           and b.status = 'confirmed'
--    group by rs.id
--    order by commission_yen desc;
