# Goddess Tour → Fourth 150-Minute Tour

Status: **STAGED — do not execute until GYG testing is complete.**
Plan approved: 25 Sep 2026. Execution = one atomic window (DB + copy + push + deploy together).

## Goal

Convert "Goddess, Queen, Empress, Concubine" from a 5.5-hour private tour
(¥28,000, max 4 guests) into a fourth standard 150-minute shared tour
(¥9,500/person, max 6 guests) with the new five-women copy.

Airbnb / GYG / Viator listing updates are handled manually by Edward, later.

## Why we wait for GYG testing

1. GYG API reads tour rows live: `src/lib/gyg/lookup.ts` pulls
   name/capacity/price/cutoff from `tours` by productId (5-min cache);
   availability comes from `tour_schedules`.
2. Atomicity: the static page and the DB must flip together. A page
   advertising ¥9,500 against a DB still charging ¥28,000 (or vice versa)
   would take wrong payments via Book Instantly.
3. Goddess currently has zero `tour_channel_listings` rows, so the in-flight
   GYG test is most likely on another tour — risk is lower, but rule 2
   applies regardless.

## Locked decisions

| Item | Decision |
|---|---|
| Schedule | Standard pattern: 10:00 daily + 13:00 Sun & Sat, duration 150 |
| Pricing | ADULT ¥9,500 + YOUTH ¥5,000 (matches standard tours) |
| Capacity | 4 → 6 |
| cutoff_minutes | 600 → 60 |
| meeting_point_address | Add CoCo Curry detail (match standard tours) |
| Meta/OG description | Amaterasu paragraph, verbatim (see below) |
| Lunch / museum | Removed everywhere (inclusions, map badge, Fujita stop, FAQ, JSON-LD) |
| Hero section | Unchanged |
| DB tour name | Unchanged — all `?tour=` links and `catalog.ts` key depend on it |
| Plan file | This file, committed to toursync |

## Part A — Database changes (Supabase, row updates only — no schema migration)

Tour: `tours.id = 3b5d63ff-c602-4ce1-a5da-1115ca5c0cbf`
(name: `Osaka Castle Goddess, Queen, Empress, Concubine`)

### A1. `tours` row

| Field | Current | Target |
|---|---|---|
| capacity | 4 | 6 |
| price | 28000 | 9500 |
| description | "Four women. Two thousand years…" (stale — says Four) | Five-women hero blurb (below) |
| cutoff_minutes | 600 | 60 |
| meeting_point_address | `2-3-6 Tanimachi, Chuo-ku, Osaka` | `2-3-6 Tanimachi, Chuo-ku, Osaka - There is a CoCo Curry House restaurant on the ground floor.` |

Target description (matches hero-sub):

> Five women. Two thousand years. Each rises to absolute power—divine,
> political, or cultural. Walk the ground where their stories unfolded and
> discover Japan from an untold perspective.

### A2. `tour_schedules` (tour_id = above)

- Deactivate the 5 existing rows: day_of_week 0,3,4,5,6 — 10:00, duration 330
- Insert 9 rows matching `beforejapanhadaname` (tour 6b3bc718-9754-4ed8-8746-040e1ccbb6de):
  - day 0 (Sun): 10:00 and 13:00
  - day 1–5 (Mon–Fri): 10:00
  - day 6 (Sat): 10:00 and 13:00
  - all: duration_minutes 150, start_date 2026-09-19 (keep), is_active true
  - user_id: copy from existing goddess schedule rows
- Constraint: `unique_schedule (tour_id, day_of_week, start_time)` — deactivate-then-insert avoids collisions

### A3. `tour_pricing_categories`

- ADULT: 28000 → 9500
- Add YOUTH: 5000 (JPY)

### Suggested SQL

```sql
begin;

update public.tours
set capacity = 6,
    price = 9500,
    cutoff_minutes = 60,
    meeting_point_address = '2-3-6 Tanimachi, Chuo-ku, Osaka - There is a CoCo Curry House restaurant on the ground floor.',
    description = 'Five women. Two thousand years. Each rises to absolute power—divine, political, or cultural. Walk the ground where their stories unfolded and discover Japan from an untold perspective.'
where id = '3b5d63ff-c602-4ce1-a5da-1115ca5c0cbf';

update public.tour_schedules
set is_active = false
where tour_id = '3b5d63ff-c602-4ce1-a5da-1115ca5c0cbf';

-- Insert 9 standard rows (user_id := from existing goddess rows)
-- Sun 10:00 / Sun 13:00 / Mon 10:00 / Tue 10:00 / Wed 10:00 / Thu 10:00 /
-- Fri 10:00 / Sat 10:00 / Sat 13:00  — duration_minutes 150, start_date '2026-09-19'

update public.tour_pricing_categories
set price = 9500
where tour_id = '3b5d63ff-c602-4ce1-a5da-1115ca5c0cbf'
  and category = 'ADULT';

insert into public.tour_pricing_categories (tour_id, user_id, category, price, currency)
select '3b5d63ff-c602-4ce1-a5da-1115ca5c0cbf', user_id, 'YOUTH', 5000, 'JPY'
from public.tour_pricing_categories
where tour_id = '3b5d63ff-c602-4ce1-a5da-1115ca5c0cbf' and category = 'ADULT'
limit 1;

commit;
```

## Part B — Static copy: public/goddess_queen_empress_concubine.html (1142 lines)

| Section (approx lines) | Action |
|---|---|
| `<title>` / meta / OG / Twitter (26–42) | Drop "Private…" / "5.5-hour". New description, verbatim: `Japan does not begin with a man. It begins with a goddess. Before emperors, before samurai, before Osaka Castle, there was Amaterasu — a goddess whose divine light crowned every ruler Japan has ever known.` |
| JSON-LD (63, 142, 275, 333, 349, 374) | Offer price 28000→9500; "5.5-hour private"→150-minute small-group; maxGuests 4→6; priceRange `¥9500 - ¥28000`→`¥9500`; FAQ answers (remove private/4-guests/lunch/museum claims) |
| Hero (682–696) | **UNCHANGED** (eyebrow, h1, tagline, hero-sub, scroll-cue) |
| CTA blocks ×2 (699, 798) | cta-sub → `Walk with a historian who lives beside it. Small groups. Osaka Castle every day • 2.5 Hours • English • ¥9,500/person`; schedule → `Weekdays: 10:00 AM<br>Weekends: 10:00 AM or 1:00 PM`; keep h2 + booking links |
| Intro (720–733) | Replace body with the new long copy (five-women narrative, from "Japan does not begin with a man." through "The women came first."); remove closer "This tour is a 5.5-hour private experience…Maximum four guests. ¥28,000 per person." |
| tour-specials (736–758) | Inclusions: max 4→6 guests line; **remove** "Tea and lunch break at The Garden Oriental Osaka" and "Fujita Museum entry tickets"; keep walk/GPS/Digital Archive. Exclusions: keep + may add lunch/museum not included |
| featured-review (761–768) | Unchanged |
| Map (771–783) | sec-title: "5.5-hour journey"→"150-minute walk"; badges: remove `Fujita Museum` (3 badges remain) |
| mapStops + cardStops JS (816+) | Rework per new itinerary: (0) Himiko @ Tanimachi 4-Chome — new first stop (use Uemachi Plateau coords near meeting point); (1) Hoenzaka / Empress Jingū; (2) Naniwa Palace / Kōgyoku **+ Shōtoku (764 rebellion)**; (3) Osaka Castle / Chacha; **remove Fujita Museum stop**; teasers rewritten from new copy |
| stops-note (791) | "Four stops…" → new stop list wording |
| FAQ (1034+) | Rewrite answers referencing 5.5h / max 4 / lunch / museum / private |
| Previous Truth-Seekers gallery, footer | Unchanged |

### New copy source

The full five-women narrative as provided by Edward (25 Sep 2026) — stored
verbatim in the session/task that executes this plan; sections: Amaterasu
opening → Himiko (Tanimachi 4-Chome) → Empress Jingū → Kōgyoku/Saimei (Naniwa)
→ Shōtoku (764 rebellion) → Chacha/Yododono (Osaka Castle) → closing
("The women came first.").

Sections explicitly UNCHANGED (Edward's instruction):

```
Osaka Castle Walks with Edward
— History Beyond the Postcard

Osaka Castle:
Goddess, Queen, Empress, Concubine
An Osaka Castle Park tour for history fans looking for a focus on Japan's most influential historical women.

Five women. Two thousand years. Each rises to absolute power—divine, political, or cultural. Walk the ground where their stories unfolded and discover Japan from an untold perspective.

Discover the stops ↓
```

## Part C — Site-wide touchpoints (all `public/`)

| File | Change |
|---|---|
| `index.html` | 2× tour cards (lines ~799, ~911): `5.5 Hours • Premium Experience`→`2.5 Hours • Walking Tour`, `¥28,000`→`¥9,500`; JSON-LD TouristTrip description (line ~390) + Offer (~415) + itinerary entries |
| `history-beyond-the-postcard.html` | tour card meta/price + any JSON-LD (note: its custom card "5 Hours" is a different card — leave) |
| `aboutme.html` | card meta (755) + price (760) |
| `faq.html` | card meta (1007) + price (1012) + any FAQ answers mentioning 5.5h/private |
| `osaka-castle-entry-tickets-guide.html` | card meta (408) + price (413) |
| `osaka-castle-vs-himeji-castle.html` | card meta (444) + price (449) |
| `osaka_history_things_to_do.html` | comparison meta (3804): `5.5 hours · ¥28,000` → `2.5 hours · ¥9,500` |
| `beforejapanhadaname.html`, `in_the_media.html`, other priceRange holders | audit `priceRange: "¥9500 - ¥28000"` — Business-wide ranges may stay (photography tour is also ¥28,000); only change goddess-scoped JSON-LD |
| `src/lib/tours/catalog.ts` (line 167) | review entry for stale private/5.5h wording |
| `src/app/sitemap.ts` | no change (slug present) |

Filter rule: **photography tour is also ¥28,000** — never bulk-replace
`28,000`; change only goddess-context lines.

## Part D — Mirror to osaka-timeline

- `osaka-timeline/goddess_queen_empress_concubine.html` (differs from toursync copy — diff first, apply equivalent changes)
- Any goddess tour cards in `osaka-timeline/*.html`
- Image/asset files: none

## Part E — Execution sequence (after GYG testing completes)

1. Run Part A SQL (Supabase — via service client or dashboard)
2. Apply Part B copy edits (toursync)
3. Apply Part C touchpoints (toursync)
4. Apply Part D mirror (osaka-timeline)
5. `npm run lint` targeted (changed HTML only — full lint OOMs; pre-existing 23k issues)
6. Commit + push both repos
   `goddess tour: fourth 150-minute tour — copy, cards, DB-aligned pricing`
7. `npm run deploy`
8. Verify:
   - `/book?tour=Osaka%20Castle%20Goddess,%20Queen,%20Empress,%20Concubine`
     shows ¥9,500, 6 guests, 150-min daily slots (incl. 13:00 weekends)
   - live goddess page: no `28,000` / `5.5` / `Private` / lunch / museum refs
   - index + card pages: ¥9,500 / 2.5 Hours
   - JSON-LD validates (offers 9500, maxGuests 6)
   - both git trees clean

## Risks / notes

- Static + DB must ship in the same window (price mismatch risk) — never split.
- GYG lookup cache is 5 minutes — after DB change, wait ≥5 min before any GYG test calls.
- Existing future bookings on goddess (if any) at ¥28,000 are unaffected — they reference the booking rows, not the tour price.
- If GYG testing reveals a goddess channel listing being added, re-check `tour_channel_listings` before executing Part A.
