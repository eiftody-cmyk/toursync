# Grant Fix for tour_channel_listings

If you get "permission denied for table tour_channel_listings" when adding GYG channel codes, run this SQL in Supabase SQL Editor:

```sql
GRANT ALL ON public.tour_channel_listings TO authenticated;
GRANT ALL ON public.tour_channel_listings TO service_role;
```

This grants the `authenticated` and `service_role` roles full access to the table. The table itself and RLS policies already exist from migration 005 — this just fixes missing table-level permissions.
