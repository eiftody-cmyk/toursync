# AEO / Agentic Search Plan — Osaka History Investigations

## Context

The education section is receiving significant organic traffic from Japan, but has **zero SEO infrastructure**. All education pages are `"use client"` components — they cannot export metadata. The root layout serves "ExperienceRelay - Block dates once. Sync everywhere." as the `<title>` for every education page. Japanese content is rendered client-side and invisible to crawlers.

This plan addresses AEO (Answer Engine Optimization) and agentic search readiness across 4 layers.

---

## Site Architecture

### Two Sites, One Domain

This is a **dual-purpose Next.js application** deployed to `osakacastletours.com`:

1. **ExperienceRelay** (`/`, `/login`, `/dashboard`, `/calendar`, `/tours`, `/settings`, `/book/*`) — A SaaS calendar sync tool for tour operators. Supabase auth, Google Calendar integration, PayPal payments. **Not related to education.**

2. **Osaka History Investigations** (`/education/*`) — A standalone bilingual education marketing site for historian-led field investigations at Osaka Castle. **This is the site getting Japanese traffic.**

The two share no layout, no components, no styling. Completely isolated at routing level.

### All Routes

| Route | Type | Renders |
|-------|------|---------|
| `/` | Static | ExperienceRelay SaaS landing page |
| `/login` | Static | Google OAuth sign-in |
| `/dashboard` | Dynamic (auth) | Tour operator dashboard |
| `/calendar` | Dynamic (auth) | Calendar management |
| `/tours` | Dynamic (auth) | Tour CRUD |
| `/settings` | Dynamic (auth) | Account settings |
| `/book` | Dynamic | Public booking page |
| `/book/custom` | Dynamic | Custom booking |
| `/book/confirm` | Dynamic | Booking confirmation |
| `/book/manage` | Dynamic | Booking management |
| **`/education`** | **Client** | **Education Hub** |
| **`/education/junior-high`** | **Client** | **Junior High School** |
| **`/education/high-school`** | **Client** | **High School** |
| **`/education/university`** | **Client** | **University** |
| **`/education/teacher-pack`** | **Client** | **Teacher Pack (Sample Lesson)** |

### Education Page Section Map

Every education page follows the same structural pattern:

```
Hero (h1) → Method → Level-Specific Content → Examples → Timeline Hooks → Pricing → How It Works → Inquiry Form
```

#### Hub (`/education`)

| # | Section | Heading | Component | CTA |
|---|---------|---------|-----------|-----|
| 1 | Hero | h1: "Osaka History Investigations — History beyond the classroom" | — | `#inquiry-form` "Request an Investigation"; Secondary: `/education/teacher-pack` |
| 2 | Problem | h3: "The Opportunity" | — | — |
| 3 | Method | h2: "Osaka History Investigations" | SocraticMethodDiagram | — |
| 4 | Students | h2: "What Students Actually Do" | Custom list | — |
| 5 | Companion | h2: "The investigation doesn't end at the castle" | Custom text | — |
| 6 | Examples | h2: "What could your students investigate?" | InvestigationExampleCard (all levels) | — |
| 7 | Timeline | h3 (inside TimelineHooks) | TimelineHooks (8 themes, limit=8) | External → `osakacastletours.com` |
| 8 | About | h2: "About Edward Iftody" | About card | External → Japan Times article |
| 9 | Pricing | h2: "Pricing" | PricingTable | — |
| 10 | How It Works | h2: "How it works" | Step list | — |
| 11 | Form | h2: "Request a Field Investigation" | InquiryForm (`#inquiry-form`) | Link: `/education/teacher-pack` |

#### Junior High (`/education/junior-high`)

| # | Section | Heading | Component | CTA |
|---|---------|---------|-----------|-----|
| 1 | Hero | h1: "History where it happened." | — | `#inquiry-form`; Secondary: `/education/teacher-pack` |
| 2 | Method | h2: "Osaka History Investigations" | SocraticMethodDiagram | — |
| 3 | Why JHS | h2: "Designed for JHS Classrooms" | Checklist | — |
| 4 | English | h2: "English Integration" | List | — |
| 5 | Curriculum | h2: "Curriculum Alignment" | CurriculumMatrix (variant="jhs") | — |
| 6 | Examples | h2: "What could your students investigate?" | InvestigationExampleCard (level="jhs") | — |
| 7 | Timeline | h3 | TimelineHooks (4 themes, limit=7) | External |
| 8 | Pricing | h2: "Pricing" | PricingTable | — |
| 9 | How It Works | h2: "How it works" | Step list | — |
| 10 | Form | h2: "Request a Field Investigation" | InquiryForm | — |

#### High School (`/education/high-school`)

| # | Section | Heading | Component | CTA |
|---|---------|---------|-----------|-----|
| 1 | Hero | h1: "Teach history where it happened." | — | `#inquiry-form`; Secondary: `/education/teacher-pack` |
| 2 | Method | h2: "Osaka History Investigations" | SocraticMethodDiagram | — |
| 3 | Why HS | h2: "Designed for Senior High" | Checklist | — |
| 4 | Inquiry Time | h2: "探究 Time Fit" | Step cards (課題の設定 → 情報の収集 → 整理・分析 → まとめ・表現) | — |
| 5 | IB/AP | h2: "IB & AP Support" | List | — |
| 6 | Curriculum | h2: "Curriculum Alignment" | CurriculumMatrix (variant="hs") | — |
| 7 | Examples | h2: "What could your students investigate?" | InvestigationExampleCard (level="hs") | — |
| 8 | Timeline | h3 | TimelineHooks (5 themes, limit=10) | External |
| 9 | Pricing | h2: "Pricing" | PricingTable | — |
| 10 | How It Works | h2: "How it works" | Step list | — |
| 11 | Form | h2: "Request a Field Investigation" | InquiryForm | — |

#### University (`/education/university`)

| # | Section | Heading | Component | CTA |
|---|---------|---------|-----------|-----|
| 1 | Hero | h1: "A mobile university seminar." | — | `#inquiry-form`; Secondary: `/education/teacher-pack` |
| 2 | Seminar Structure | h2: (from uni.method.title) | SocraticMethodDiagram (variant="university") | — |
| 3 | Provides | h2: (from uni.why.title) | Checklist | — |
| 4 | Topics | h2: "Example Seminar Topics" | Topic card grid (each with h3) | — |
| 5 | Discipline | h2: "Discipline Alignment" | CurriculumMatrix (variant="university") | — |
| 6 | Examples | h2: "What could your students investigate?" | InvestigationExampleCard (level="university") | — |
| 7 | Timeline | h3 | TimelineHooks (6 themes, limit=18) | External |
| 8 | Pricing | h2: "Pricing" | PricingTable + "University Field Seminar" card | — |
| 9 | How It Works | h2: "How it works" | Step list | — |
| 10 | Form | h2: "Request a Field Investigation" | InquiryForm | — |

#### Teacher Pack (`/education/teacher-pack`)

| # | Section | Heading | Component | CTA |
|---|---------|---------|-----------|-----|
| 1 | Hero | h1: "See a Field Investigation in Action" | — | `#inquiry-form`; Secondary: `/education` "Back to Overview" |
| 2 | Objective | h3: (from tp.objective.title) | edu-problem card | — |
| 3 | Question | h2: (from tp.question.title) | Italic quote | — |
| 4 | Before Visit | h2: (from tp.before.title) | Checklist | — |
| 5 | Flow | h2: "Field Investigation Flow" | mockup-timeline (3 sites, h3 + h4 sub-headings) | — |
| 6 | Analysis | h2: (from tp.resolution.title) | List with arrows | — |
| 7 | Assessment | h2: "After the Visit — Example Assessment" | mockup-assessment (3 question types) | — |
| 8 | Closing | (no heading) | Blockquote | — |
| 9 | Included | h2: "Every Field Lesson Can Include" | included-grid | — |
| 10 | Logistics | h2: (from tp.logistics.title) | List | — |
| 11 | Pricing | h2: "Pricing" | PricingTable | — |
| 12 | How It Works | h2: "How it works" | Step list | — |
| 13 | Form | h2: "Request a Field Investigation" | InquiryForm | — |

### Header Navigation

All education pages share a sticky header with:

| Nav Item | EN Text | JA Text | Link |
|----------|---------|---------|------|
| Hub | "Home" | "ホーム" | `/education` |
| Junior High | "Junior High" | "中学校" | `/education/junior-high` |
| High School | "High School" | "高等学校" | `/education/high-school` |
| University | "University" | "大学" | `/education/university` |
| Teacher Pack | "Sample Lesson" | "授業見本" | `/education/teacher-pack` |

Header actions: Language toggle (EN / 日本語) + CTA "Request an Investigation" → `#inquiry-form`

### Internal Link Map

```
                    ┌─────────────────────────┐
                    │     /education (Hub)      │
                    │  Hero CTA → teacher-pack  │
                    │  Form link → teacher-pack │
                    └────────┬────────────────┘
                             │
              Header Nav connects all 5 pages
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
  /education/          /education/          /education/
  junior-high          high-school          university
        │                    │                    │
        │    All link to:    │    All link to:    │
        │    teacher-pack    │    teacher-pack    │
        │    (hero CTA)      │    (hero CTA)      │
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────┴────────┐
                    │  /education/     │
                    │  teacher-pack    │
                    │  "Back to        │
                    │   Overview" →    │
                    │   /education     │
                    └─────────────────┘
```

**Key observation:** No cross-links between level-specific pages (junior-high ↔ high-school ↔ university). Only Hub ↔ Teacher Pack is bidirectional.

### External Links

| Location | URL | Context |
|----------|-----|---------|
| Footer | `https://osakacastletours.com` | "Osaka Castle Walks" |
| Footer | `https://osakacastletours.com/aboutme` | "About Edward" |
| Footer | `https://osakacastletours.com/faq` | "FAQ" |
| About section | `https://www.japantimes.co.jp/commentary/2026/07/22/japan/japan-new-imperial-house-law/` | Published in The Japan Times |
| Timeline cards | `https://osakacastletours.com/{slug}.html` (EN) / `https://osakacastletours.com/ja/{slug}.html` (JA) | 18 timeline articles |

### Hero Images

| Page | CSS Class | Image |
|------|-----------|-------|
| Hub | `bg-hideyoshi` | `/images/toyotomihideyoshi.webp` |
| Junior High | `bg-hideyori` | `/images/yododonohideyori.webp` |
| High School | `bg-kofun` | `/images/new_kofun.webp` |
| University | `bg-shotoku` | `/images/empress-shotoku.webp` |
| Teacher Pack | `bg-michizane` | `/images/sanadacharge.webp` |

### Timeline Links

18 historical timeline articles hosted on `osakacastletours.com`, linked from education pages via TimelineHooks component. Topics span prehistoric Osaka through modern era. Each card shows: hero thumbnail, title, period badge, and external link.

---

## Current State (SEO Gaps)

| What | Status |
|------|--------|
| `<title>` / `<meta description>` | **Missing** — all education pages inherit root "ExperienceRelay" title |
| `<html lang="en">` hardcoded | **Japanese content invisible to crawlers** |
| Structured data (JSON-LD) | **None** — no Organization, no EducationalOrganization, no FAQPage |
| `sitemap.ts` | **None** |
| `robots.ts` | **None** — AI crawlers may be blocked by default |
| `llms.txt` | **None** |
| OpenGraph / social sharing | **None** |
| `canonical` / `alternates` | **None** |
| Server-rendered Japanese content | **None** — language toggle is client-side only |
| `dateModified` signals | **None** |

---

## Layer 0 — Crawlability (this week, ~30 min)

### robots.ts

Allow all AI crawlers explicitly:

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /
```

### sitemap.ts

Dynamic sitemap including all education pages:

```
/education
/education/junior-high
/education/high-school
/education/university
/education/teacher-pack
```

### llms.txt

Site-level routing file at domain root listing high-value pages with descriptions.

---

## Layer 1 — Metadata & Server-Side Japanese (next sprint, ~3 hrs)

### Architecture

Convert education layout to server component, move client state into a child provider:

```
education/layout.tsx (SERVER — exports metadata)
  └─ education/ClientLayout.tsx (CLIENT — useLocale, Header, Footer)
       └─ {children}
```

This lets each page export metadata via `generateMetadata` while keeping the client-side locale toggle.

### Metadata per page (bilingual)

| Page | EN Title | JA Title |
|------|----------|----------|
| Hub | Osaka History Investigations — Field Seminars for Schools | 大阪歴史フィールド探究 — 学校向けセミナー |
| JHS | Junior High School — Osaka History Field Investigations | 中学校 — 大阪歴史フィールド探究 |
| HS | High School — Historical Inquiry at Osaka Castle | 高校 — 大阪城での歴史探究 |
| University | University Field Seminars — Osaka History & Archaeology | 大学フィールドセミナー — 大阪の歴史と考古学 |
| Teacher Pack | Teacher Pack — Pre-Visit & Post-Visit Materials | 教師用パック — 事前・事後教材 |

### `<html lang>` switching

Add `lang` attribute switching per route so Japanese pages tell crawlers they're Japanese.

---

## Layer 2 — Structured Data (next sprint, ~2 hrs)

### Organization JSON-LD (sitewide, in root layout)

```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Osaka History Investigations",
  "alternateName": "大阪歴史フィールド探究",
  "url": "https://osakacastletours.com/education",
  "logo": "https://osakacastletours.com/images/logo.webp",
  "description": "Historian-led field investigations at Osaka Castle for schools and universities.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Osaka",
    "addressCountry": "JP"
  },
  "founder": {
    "@type": "Person",
    "name": "Edward Iftody",
    "url": "https://osakacastletours.com/aboutme"
  },
  "sameAs": [
    "https://www.japantimes.co.jp/commentary/2026/07/22/japan/japan-new-imperial-house-law/"
  ]
}
```

### Article JSON-LD (per education page)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Junior High School — Osaka History Field Investigations",
  "description": "Curriculum-aligned...",
  "author": {
    "@type": "Person",
    "name": "Edward Iftody",
    "url": "https://osakacastletours.com/aboutme"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Osaka Castle Walks with Edward"
  },
  "datePublished": "2026-01-01",
  "dateModified": "2026-09-17",
  "inLanguage": ["en", "ja"]
}
```

### FAQPage JSON-LD (hub education page)

Q&A format has 81% citation probability per industry research.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a field investigation at Osaka Castle?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A historian-led educational session at Osaka Castle where students examine primary sources, ask historical questions, and develop interpretations — not a guided tour."
      }
    },
    {
      "@type": "Question",
      "name": "大阪城でのフィールド探究とは何ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "歴史家が指導する大阪城での教育セッション。一次資料の観察、歴史的問いの設定、解釈の構築を行います。観光ツアーではありません。"
      }
    }
  ]
}
```

### OpenGraph images per page

Add OG image metadata for social sharing previews.

---

## Layer 3 — AEO Content Formatting (ongoing, ~3–4 hrs)

### Answer-first structure

Each section leads with a 40–60 word direct answer:

Current:
> "Our Method" → long paragraph explaining the process

AEO-optimized:
> **What is the investigation method?**
> Students receive an inquiry question at Osaka Castle, examine the landscape and primary sources, discuss competing interpretations, and develop evidence-based historical arguments. The process follows: Question → Evidence → Comparison → Interpretation → Argument.

### FAQ sections on each education page

Bilingual Q&A pairs:

| Question (EN) | Question (JA) |
|---------------|---------------|
| What grades is this suitable for? | 何年生が対象ですか？ |
| How long does a session last? | 1回のセッションはどのくらいですか？ |
| Is it conducted in English? | 英語で行いますか？ |
| Can we customize the topic? | テーマをカスタマイズできますか？ |
| What is included in the price? | 料金に何が含まれますか？ |
| Do you provide teaching materials? | 教材は提供しますか？ |
| How do we book? | 予約方法は？ |
| Where does the session take place? | 場所はどこですか？ |

### Visible `dateModified`

Add "Last updated: September 2026" to each education page.

---

## Japanese Indexing Architecture Decision

### Option A — Metadata only
Add `<html lang>` hints and bilingual metadata. Google knows Japanese exists but can't read the body text. Quick fix, limited results.

### Option B — Full `/ja/` routes
Create separate URLs like `/ja/education/junior-high` serving fully Japanese HTML from the server. Maximum Japanese SEO but requires restructuring routes.

### Option C — Hybrid (recommended)
Keep client toggle for UX. Add server-rendered metadata + structured data in both languages + `hreflang` tags. Best effort-to-impact ratio.

**Recommendation:** Start with C now. Plan B for later if Japanese traffic keeps growing.

---

## Implementation Priority

| Priority | What | Effort | Impact |
|----------|------|--------|--------|
| **P0** | robots.ts + sitemap.ts | 30 min | AI crawlers can discover and access all pages |
| **P0** | Server-side metadata for education pages | 2–3 hrs | `<title>`, `<meta description>` finally match content |
| **P1** | `<html lang>` switching per route | 1 hr | Japanese pages tell crawlers they're Japanese |
| **P1** | Organization JSON-LD (sitewide) | 30 min | Brand entity recognized by AI systems |
| **P1** | Article JSON-LD per education page | 1 hr | Rich results eligibility, author/date signals |
| **P2** | FAQPage JSON-LD + visible FAQ sections | 2 hrs | Highest citation probability format (81%) |
| **P2** | llms.txt at domain root | 30 min | AI agents get site routing map |
| **P2** | OpenGraph images per page | 1 hr | Social sharing previews |
| **P3** | Answer-first content restructuring | 3–4 hrs | Direct answer extraction for AI Overviews |
| **P3** | Bilingual canonical URLs (`/en/`, `/ja/` prefixes) | 4+ hrs | Proper indexing of both language versions |

---

## Key Research Sources

- Google's AI optimization guide (May 2026): https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Schema for Agentic Search reference (May 2026): https://wetheflywheel.com/en/ai-search/schema-for-agentic-search/
- Agentic Search Optimization guide (June 2026): https://www.similarweb.com/blog/marketing/geo/agentic-search-optimization/
- AEO guide (May 2026): https://www.marqops.com/blog/answer-engine-optimization
- HubSpot AEO best practices: https://blog.hubspot.com/marketing/answer-engine-optimization-best-practices

---

## What NOT to Change

- Pricing / product structure
- Hero sections
- Navigation
- Forms
- Timeline content
- Investigation examples
- Existing internal links
