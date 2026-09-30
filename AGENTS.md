<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Supabase: explicit grants for new public tables (from Oct 30)

Supabase no longer auto-grants Data API access to new tables in `public`. Any migration that creates a table must include explicit GRANTs in the same migration, or the table is unreachable via PostgREST/GraphQL/supabase-js (permission denied).

Add grants in the same migration that creates the table:

```sql
grant select on public.your_table to anon;
grant select, insert, update, delete on public.your_table to authenticated;
grant select, insert, update, delete on public.your_table to service_role;
```

Adjust privileges per table (e.g. read-only for public tables — see existing migrations like `013_grants.sql`, `018_public_read_tours.sql`, `027_grant_permissions.sql`). Applies to new projects, preview branches, and `supabase db reset`.

# EN/JA deep timeline parity (static HTML)

`public/deeptimeline.html` and `public/ja/deeptimeline.html` must list the **same entries in the same order** in both the *Historical Reference Index* section and the `<!-- CONTINUE EXPLORING -->` list — every entry linked, every local href resolving to a file under `public/` (JA hrefs are `/ja/` + the EN slug).

After editing either page run:

```bash
npm run check:parity
```

The same check runs automatically in `npm run build`, `npm run preview`, `npm run deploy`, and in CI (`.github/workflows/deeptimeline-parity.yml`). Do not delete or bypass `scripts/check-deeptimeline-parity.mjs` — it exists because the JA index lost 8 links in a dead-link cleanup (osaka-timeline `21684db`, 2026-09-17) 39 minutes before the JA target pages were added, and the links were never restored.
