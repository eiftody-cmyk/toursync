# Seed Pricing Categories for GYG Self-Testing

Run this SQL in **Supabase Dashboard → SQL Editor**.

```sql
-- T-1221780 (Before Japan Had a Name) - individual: ADULT + SENIOR
INSERT INTO tour_pricing_categories (tour_id, category, price, currency)
SELECT tcl.tour_id, 'ADULT', t.price::int, t.currency
FROM tour_channel_listings tcl
JOIN tours t ON t.id = tcl.tour_id
WHERE tcl.external_product_code = 'T-1221780' AND tcl.channel = 'gyg'
ON CONFLICT (tour_id, category) DO NOTHING;

INSERT INTO tour_pricing_categories (tour_id, category, price, currency)
SELECT tcl.tour_id, 'SENIOR', t.price::int, t.currency
FROM tour_channel_listings tcl
JOIN tours t ON t.id = tcl.tour_id
WHERE tcl.external_product_code = 'T-1221780' AND tcl.channel = 'gyg'
ON CONFLICT (tour_id, category) DO NOTHING;

-- T-1216886 (Lord, Concubine, Shogun) - individual: ADULT + SENIOR
INSERT INTO tour_pricing_categories (tour_id, category, price, currency)
SELECT tcl.tour_id, 'ADULT', t.price::int, t.currency
FROM tour_channel_listings tcl
JOIN tours t ON t.id = tcl.tour_id
WHERE tcl.external_product_code = 'T-1216886' AND tcl.channel = 'gyg'
ON CONFLICT (tour_id, category) DO NOTHING;

INSERT INTO tour_pricing_categories (tour_id, category, price, currency)
SELECT tcl.tour_id, 'SENIOR', t.price::int, t.currency
FROM tour_channel_listings tcl
JOIN tours t ON t.id = tcl.tour_id
WHERE tcl.external_product_code = 'T-1216886' AND tcl.channel = 'gyg'
ON CONFLICT (tour_id, category) DO NOTHING;

-- T-1218058 (Warrior Monks) - individual: ADULT + SENIOR
INSERT INTO tour_pricing_categories (tour_id, category, price, currency)
SELECT tcl.tour_id, 'ADULT', t.price::int, t.currency
FROM tour_channel_listings tcl
JOIN tours t ON t.id = tcl.tour_id
WHERE tcl.external_product_code = 'T-1218058' AND tcl.channel = 'gyg'
ON CONFLICT (tour_id, category) DO NOTHING;

INSERT INTO tour_pricing_categories (tour_id, category, price, currency)
SELECT tcl.tour_id, 'SENIOR', t.price::int, t.currency
FROM tour_channel_listings tcl
JOIN tours t ON t.id = tcl.tour_id
WHERE tcl.external_product_code = 'T-1218058' AND tcl.channel = 'gyg'
ON CONFLICT (tour_id, category) DO NOTHING;

-- T-1216978 (Photography After Dark) - individual: ADULT + SENIOR
INSERT INTO tour_pricing_categories (tour_id, category, price, currency)
SELECT tcl.tour_id, 'ADULT', t.price::int, t.currency
FROM tour_channel_listings tcl
JOIN tours t ON t.id = tcl.tour_id
WHERE tcl.external_product_code = 'T-1216978' AND tcl.channel = 'gyg'
ON CONFLICT (tour_id, category) DO NOTHING;

INSERT INTO tour_pricing_categories (tour_id, category, price, currency)
SELECT tcl.tour_id, 'SENIOR', t.price::int, t.currency
FROM tour_channel_listings tcl
JOIN tours t ON t.id = tcl.tour_id
WHERE tcl.external_product_code = 'T-1216978' AND tcl.channel = 'gyg'
ON CONFLICT (tour_id, category) DO NOTHING;

-- T-1258476 (Goddess) - group: GROUP only
INSERT INTO tour_pricing_categories (tour_id, category, price, currency)
SELECT tcl.tour_id, 'GROUP', t.price::int, t.currency
FROM tour_channel_listings tcl
JOIN tours t ON t.id = tcl.tour_id
WHERE tcl.external_product_code = 'T-1258476' AND tcl.channel = 'gyg'
ON CONFLICT (tour_id, category) DO NOTHING;
```

## What This Does

| Product | Tour | Categories Added |
|---------|------|-----------------|
| T-1221780 | Before Japan Had a Name | ADULT, SENIOR |
| T-1216886 | Lord, Concubine, Shogun | ADULT, SENIOR |
| T-1218058 | Warrior Monks | ADULT, SENIOR |
| T-1216978 | Photography After Dark | ADULT, SENIOR |
| T-1258476 | Goddess | GROUP |

Uses the tour's existing price from the `tours` table. `ON CONFLICT DO NOTHING` prevents duplicates.
