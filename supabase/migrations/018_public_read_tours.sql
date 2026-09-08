-- Allow public read access to tours (needed for /book pages)
-- Tours are public-facing and should be browsable without auth

drop policy if exists "Public can view active tours" on public.tours;
create policy "Public can view active tours" on public.tours
  for select
  using (true);
