#!/usr/bin/env node
// Sync JSON-LD review schema from testimonials.html (source of truth).
// - Rewrites testimonials aggregateRating + Review nodes + dateModified
// - Propagates reviewCount to index + guide pages
// - Strips stale tour-local aggregateRating/review blocks
// Fails if the Google review section yields 0 cards.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

const TESTIMONIALS = join(pub, "testimonials.html");
const COUNT_TARGETS = [
  join(pub, "index.html"),
  join(pub, "osaka-castle-entry-tickets-guide.html"),
  join(pub, "osaka-castle-vs-himeji-castle.html"),
  join(pub, "photography-guide.html"),
];
const STRIP_TARGETS = [join(pub, "warriormonkspeasantshogun.html")];

const SITE = "https://osakacastletours.com/testimonials";

function fail(msg) {
  console.error(`sync-review-schema: ${msg}`);
  process.exit(1);
}

function unescapeHtml(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&amp;/g, "&");
}

function extractJsonLd(html, file) {
  const m = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  );
  if (!m) fail(`no JSON-LD script block in ${file}`);
  try {
    return { raw: m[0], body: m[1], data: JSON.parse(m[1]) };
  } catch (e) {
    fail(`JSON-LD parse error in ${file}: ${e.message}`);
  }
}

function googleCards(html) {
  const start = html.indexOf('<section class="t-grid">');
  const end = html.indexOf(
    "★★★★★ 5.0 Rated by Guests on Airbnb, Viator"
  );
  if (start < 0 || end < 0 || end <= start)
    fail("could not locate Google review section in testimonials.html");
  const section = html.slice(start, end);
  const texts = [...section.matchAll(/<p class="review-text">([\s\S]*?)<\/p>/g)]
    .map((m) => unescapeHtml(m[1].trim()).replace(/\s+/g, " "))
    .filter(Boolean);
  const authors = [
    ...section.matchAll(/<p class="review-author">\s*—\s*([^,<]+)/g),
  ]
    .map((m) => m[1].trim())
    .filter(Boolean);
  if (texts.length === 0)
    fail("0 Google review cards found in testimonials.html");
  if (texts.length !== authors.length)
    fail(
      `review text/author mismatch (${texts.length} texts, ${authors.length} authors)`
    );
  return texts.map((text, i) => ({ name: authors[i], text }));
}

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// ── 1. Testimonials rewrite ──────────────────────────────────────────
const tHtml = readFileSync(TESTIMONIALS, "utf8");
const cards = googleCards(tHtml);
const count = String(cards.length);

const tLd = extractJsonLd(tHtml, "testimonials.html");
const graph = tLd.data["@graph"];
const business = graph.find((n) => n["@type"] === "LocalBusiness");
const article = graph.find((n) => n["@type"] === "Article");
if (!business) fail("no LocalBusiness in testimonials JSON-LD");
if (!article) fail("no Article in testimonials JSON-LD");

const reviewNodes = cards.map((c) => ({
  "@type": "Review",
  "@id": `${SITE}#review-${c.name.toLowerCase()}`,
  author: { "@type": "Person", name: c.name },
  reviewRating: { "@type": "Rating", ratingValue: "5" },
  reviewBody: c.text,
}));

const prevIds = (business.review || []).map((r) => r["@id"]);
const prevBodies = graph
  .filter((n) => n["@type"] === "Review")
  .map((n) => n.reviewBody);
const nextIds = reviewNodes.map((r) => r["@id"]);
const nextBodies = reviewNodes.map((r) => r.reviewBody);
const changed =
  prevIds.join("\n") !== nextIds.join("\n") ||
  prevBodies.join("\n") !== nextBodies.join("\n") ||
  business.aggregateRating?.reviewCount !== count;

business.aggregateRating = {
  "@type": "AggregateRating",
  ratingValue: "5.0",
  reviewCount: count,
  bestRating: "5",
  worstRating: "1",
};
business.review = nextIds.map((id) => ({ "@id": id }));

const rebuilt = [];
for (const n of graph) {
  if (n["@type"] === "Review") continue;
  rebuilt.push(n);
  if (n["@type"] === "LocalBusiness") rebuilt.push(...reviewNodes);
}
tLd.data["@graph"] = rebuilt;
if (changed) article.dateModified = today();

const newBody = JSON.stringify(tLd.data, null, 2);
const newHtml = tHtml.replace(tLd.body, newBody);
if (newHtml !== tHtml) {
  writeFileSync(TESTIMONIALS, newHtml);
  console.log(
    `sync-review-schema: testimonials.jsonld updated (reviewCount=${count}${changed ? ", dateModified bumped" : ""})`
  );
} else {
  console.log(`sync-review-schema: testimonials already in sync (reviewCount=${count})`);
}

// ── 2. Propagate reviewCount ─────────────────────────────────────────
for (const file of COUNT_TARGETS) {
  const html = readFileSync(file, "utf8");
  const next = html.replace(
    /("aggregateRating"[\s\S]*?"reviewCount"\s*:\s*")\d+(")/,
    `$1${count}$2`
  );
  if (next !== html) {
    writeFileSync(file, next);
    console.log(
      `sync-review-schema: reviewCount=${count} propagated to ${file.slice(root.length + 1)}`
    );
  }
}

// ── 3. Strip stale tour-local aggregateRating/review ────────────────
for (const file of STRIP_TARGETS) {
  const html = readFileSync(file, "utf8");
  if (!html.includes('"aggregateRating"') && !html.includes('"review"')) {
    continue;
  }
  const ld = extractJsonLd(html, file);
  let dirty = false;
  for (const n of ld.data["@graph"] || []) {
    if (n.aggregateRating) {
      delete n.aggregateRating;
      dirty = true;
    }
    if (n.review) {
      delete n.review;
      dirty = true;
    }
  }
  if (dirty) {
    writeFileSync(file, html.replace(ld.body, JSON.stringify(ld.data, null, 2)));
    console.log(
      `sync-review-schema: stripped aggregateRating/review from ${file.slice(root.length + 1)}`
    );
  }
}

console.log(`sync-review-schema: OK (${count} Google reviews)`);
