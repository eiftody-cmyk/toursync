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

# JSON-LD / AEO guard (static HTML)

Every static page under `public/` must keep its structured data and head tags in this state:

- every `<script type="application/ld+json">` block parses; no raw HTML entities inside JSON-LD strings
- `rel=canonical`, `og:url` and `hreflang` are **extensionless** (middleware 301s every `.html` URL — a canonical that redirects is a self-contradiction) and canonical === og:url
- every first-party hreflang target and JSON-LD `image` resolves to a file under `public/`
- EN/JA **FAQPage parity**: if one locale's page declares FAQPage, the slug-matched twin must too (FAQ JSON-LD without visible Q&A is a Google guideline violation — add the visible section, as EN `three-unifiers` did)
- JA pages declare `inLanguage: "ja"` somewhere in their JSON-LD; EN pages never declare `"ja"`
- indexable pages carry meta description, og:title, og:description and a canonical (noindex pages exempt)

After editing any static page or JSON-LD builder run:

```bash
npm run check:data
```

The check also runs in `npm run build`, `npm run preview`, `npm run deploy`, and in CI (`.github/workflows/deeptimeline-parity.yml`). It exists because redirecting canonicals (19 JA pages), 8 dead JSON-LD image URLs and 6 EN pages without FAQPage shipped unnoticed — nothing was broken enough for a link checker to fail.

# JA naturalness guard (public/ja)

`public/ja/*.html` follows `JA_STYLE_GUIDE.md`; machine-readable term rules
live in `data/ja-glossary.json`. After any JA edit run:

```bash
npm run check:ja
```

It fails on simplified-Chinese characters, forbidden terminology
(大阪の陣, Chinese forms, calques), untranslated English paragraphs, and —
once `JA_STRICT_TITLES=1` — title drift (dash chars, タイムライン in titles,
brand suffix must be `| エドワードと歩く大阪城`). Runs in `npm run build`,
`preview`, `deploy` and CI. Term edits go in the glossary first, then the page.
