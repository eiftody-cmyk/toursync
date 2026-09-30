-- 036: Payout modes for referral partners — percent OR flat ¥ per guest
-- Run in Supabase SQL editor (035 must be applied first), then verify with
-- the queries at the bottom.
--
-- Each partner picks how they get paid, edited together in the table editor:
--   payout_type = 'percent'        → payout_rate is a % of booking value
--                                     (0–100, e.g. 10)
--   payout_type = 'flat_per_guest' → payout_rate is ¥ per guest
--                                     (e.g. 1500)
-- Existing rows default to 'percent', so every current rate keeps working.
-- Code falls back to 10% for all partners until this migration exists.

alter table public.referral_partners
  add column if not exists payout_type text not null default 'percent'
    check (payout_type in ('percent', 'flat_per_guest'));

-- Recreate the value check so it validates against the row's own mode.
alter table public.referral_partners
  drop constraint if exists referral_partners_payout_rate_check;

alter table public.referral_partners
  add constraint referral_partners_payout_rate_check check (
    (payout_type = 'percent' and payout_rate >= 0 and payout_rate <= 100)
    or (payout_type = 'flat_per_guest' and payout_rate >= 0)
  );

-- Verify:
--   select slug, payout_type, payout_rate
--     from public.referral_partners order by slug;
--   -- expect every row payout_type='percent', payout_rate=10 (or your manual rate)
--
--   -- Offer a partner a flat fee instead (e.g. ryuterhua at ¥1,500/guest):
--   -- update public.referral_partners
--   --    set payout_type = 'flat_per_guest', payout_rate = 1500
--   --    where slug = 'ryuterhua';
--
--   -- Rejected by the check (try these to confirm):
--   --   payout_type='percent',        payout_rate=1500  → >100 percent
--   --   payout_type='flat_per_guest', payout_rate=-5    → negative
--
--   -- Payout preview (confirmed, partner-attributed):
--   -- percent     → round(price * guests * payout_rate / 100)
--   -- flat        → round(guests * payout_rate)
--   select rs.display_name,
--          rs.partner,
--          rp.payout_type,
--          rp.payout_rate,
--          coalesce(sum(b.guest_count), 0)             as guests,
--          coalesce(sum(
--            case when rp.payout_type = 'flat_per_guest'
--                 then round(b.guest_count * rp.payout_rate)
--                 else round((t.price * b.guest_count)
--                            * rp.payout_rate / 100)
--            end), 0)                                  as payout_yen
--     from public.referral_staff rs
--     left join public.referral_partners rp on rp.slug = rs.partner
--     left join public.bookings b
--            on b.source = rs.partner
--           and b.referrer_staff = rs.slug
--           and b.status = 'confirmed'
--     left join public.tours t on t.id = b.tour_id
--    group by rs.id, rs.partner, rp.payout_type, rp.payout_rate
--    order by payout_yen desc;
