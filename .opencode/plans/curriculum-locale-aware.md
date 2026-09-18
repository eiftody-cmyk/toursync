# Plan: Make Curriculum Alignment Charts Locale-Aware

## Problem

The JHS, HS, and University curriculum charts currently display Japanese text on English pages. Column headers like `中学社会・歴史`, `歴史総合`, `日本史探究`, and cell content like `中1・先史日本`, `証拠と解釈`, `国家形成の空間分析` all appear on English-language pages.

## Approach

Add English fields to each row interface alongside the existing Japanese fields. The `CurriculumMatrix` component already has `locale` from `useLocale()` — use it to switch between English and Japanese column headers and cell content.

**No new data arrays.** Extend the existing interfaces with `*En` fields. This keeps the data in one place per variant.

---

## Files to Modify (2)

### 1. `src/lib/education/curriculum-alignment.ts`

**Extend interfaces with English fields:**

```ts
// JHS
jhsSocialEn: string;
rekishSogoEn: string;
nihonshiTankyuEn: string;
tankyuEn: string;

// HS
rekishSogoEn: string;
nihonshiTankyuEn: string;
tankyuEn: string;

// University
historyEn: string;
archaeologyEn: string;
histGeoEn: string;
poliSciEn: string;
japaneseStudiesEn: string;
```

**Populate English cell content** from the task brief (exact values provided in the task).

English data for JHS (9 rows):

| Theme | JHS Social Studies | Historical Studies | Japanese History Studies | Inquiry |
|-------|-------------------|-------------------|------------------------|---------|
| Jomon–Yayoi | Grade 7 · Prehistoric Japan | — | Prehistoric Japan | Evidence & Interpretation |
| Ancient Osaka | Grade 7 · Ancient Japan | — | Early State Formation | Historical Question |
| Warrior Monks | Grade 7 · Medieval Japan | — | Medieval Political Power | Evidence & Interpretation |
| Hideyoshi | Grade 8 · Sengoku–Unification | Relevant | Sengoku & Unification | Geography & Power |
| Tokugawa | Grade 8 · Early Modern Japan | Relevant | Early Modern Political Order | Legitimacy & Propaganda |
| Meiji | Grade 9 · Modern Japan | Modernization & Social Change | Modern Japan | Change & Continuity |
| Power & Propaganda | Grade 8 · Political Power | — | Political Legitimacy | Legitimacy & Narrative |
| Historical Memory | Grade 9 · Modern & Contemporary Japan | Historical Interpretation | Multiple Historical Interpretations | Multiple Perspectives |
| Geography & Power | Grades 7–8 · Geography & Politics | Spatial Analysis | State Formation & Territory | Geography & Power |

English data for HS (9 rows):

| Theme | Historical Studies | Japanese History Studies | Inquiry |
|-------|-------------------|------------------------|---------|
| Jomon–Yayoi | — | Prehistoric Japan | Evidence & Interpretation |
| Ancient Osaka | Ancient State Formation | Ancient Japan | Historical Question |
| Warrior Monks | Medieval Political Power | Medieval Japan | Evidence & Interpretation |
| Hideyoshi | Sengoku & Unification | Sengoku & Unification | Geography & Power |
| Tokugawa | Early Modern Political Order | Early Modern Japan | Legitimacy & Propaganda |
| Meiji | Modernization & Social Change | Modern Japan | Change & Continuity |
| Power & Propaganda | Political Legitimacy | Political Power | Legitimacy & Narrative |
| Historical Memory | Historical Interpretation | Multiple Historical Interpretations | Multiple Perspectives |
| Geography & Power | Spatial Analysis | State Formation & Territory | Geography & Power |

English data for University (7 rows) — exact values from the task brief.

### 2. `src/components/education/CurriculumMatrix.tsx`

**Make column headers locale-aware:**

```ts
const jhsHeadersEn = [
  { key: "jhsSocialEn", label: "JHS Social Studies" },
  { key: "rekishSogoEn", label: "Historical Studies" },
  { key: "nihonshiTankyuEn", label: "Japanese History Studies" },
  { key: "tankyuEn", label: "Inquiry" },
  { key: "english", label: "English" },
  { key: "ib", label: "IB" },
  { key: "ap", label: "AP" },
];
// Same pattern for hsHeadersEn, uniHeadersEn
```

**Switch headers and cell fields based on locale:**

```ts
const isEn = locale === "en";
const headers = isJhs ? (isEn ? jhsHeadersEn : jhsHeadersJa) : ...;
```

**Cell rendering** — read `*En` field when English, original field when Japanese:

```ts
{headers.map((h) => (
  <td key={h.key}>
    {getFieldValue(row as unknown as Record<string, unknown>, h.key)}
  </td>
))}
```

Since the header `key` already points to the correct field (`jhsSocialEn` for English, `jhsSocial` for Japanese), the existing `getFieldValue` logic works without changes.

**Filter labels** — already have English `label` and Japanese `labelJa`, no change needed.

---

## What Does NOT Change

- `curriculumAlignment` (legacy/hub data) — already has English cell content
- Japanese content in any data array — the `*En` fields are additions, not replacements
- Page files — no changes needed (locale already flows via context)
- Hero sections, pricing, forms, examples, navigation, SEO
- University page's `CurriculumMatrix variant="university"` call
- Responsive CSS
- Filter behavior

---

## Verification

After implementation, check all 6 combinations:

| Page | Locale | Expected |
|------|--------|----------|
| JHS | en | English headers, English cell content, no Japanese |
| JHS | ja | Japanese headers, Japanese cell content, no English replacements |
| HS | en | English headers, English cell content, no Japanese |
| HS | ja | Japanese headers, Japanese cell content |
| University | en | English headers, English cell content |
| University | ja | Japanese headers, Japanese cell content |

Also verify:
- Filter labels switch correctly
- Theme column switches (already works)
- `✓`/`✓✓` and `—` behavior unchanged
- Mobile layout still works
- No Japanese text on English pages
- No English text on Japanese pages
