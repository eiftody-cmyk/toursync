-- Grant anon SELECT on tables needed by /book pages
-- The /book pages use the anon key to fetch available dates
-- Without these, the calendar shows "No available dates"

GRANT SELECT ON public.tour_schedules TO anon;
GRANT SELECT ON public.schedule_exceptions TO anon;
GRANT SELECT ON public.blocked_dates TO anon;
GRANT SELECT ON public.bookings TO anon;

drop policy if exists "Public can view schedules" on public.tour_schedules;
create policy "Public can view schedules" on public.tour_schedules for select using (true);

drop policy if exists "Public can view exceptions" on public.schedule_exceptions;
create policy "Public can view exceptions" on public.schedule_exceptions for select using (true);

drop policy if exists "Public can view blocked" on public.blocked_dates;
create policy "Public can view blocked" on public.blocked_dates for select using (true);

drop policy if exists "Public can view bookings" on public.bookings;
create policy "Public can view bookings" on public.bookings for select using (true);
