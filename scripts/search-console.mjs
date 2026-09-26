#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GSC_BASE = "https://www.googleapis.com/webmasters/v3";
const INSPECT_URL = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";

function loadDotEnv() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

function expandHome(p) {
  return p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p;
}

function loadServiceAccount() {
  const file = expandHome(
    process.env.GSC_SERVICE_ACCOUNT_FILE ||
      path.join(os.homedir(), ".config/toursync/gsc-sa.json")
  );
  if (!fs.existsSync(file)) {
    console.error(`Service account key not found: ${file}`);
    console.error("Set GSC_SERVICE_ACCOUNT_FILE in .env.local or save the JSON key there.");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function b64url(s) {
  return Buffer.from(s).toString("base64url");
}

function signJwt(keyJson, scope) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned =
    b64url(JSON.stringify({ alg: "RS256", typ: "JWT" })) +
    "." +
    b64url(
      JSON.stringify({
        iss: keyJson.client_email,
        scope,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
      })
    );
  const sig = crypto
    .sign("sha256", Buffer.from(unsigned), {
      key: keyJson.private_key,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    })
    .toString("base64url");
  return `${unsigned}.${sig}`;
}

async function getAccessToken(keyJson, scope) {
  const jwt = signJwt(keyJson, scope);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tok = await res.json();
  if (!tok.access_token) {
    console.error("Token exchange failed:", JSON.stringify(tok));
    process.exit(1);
  }
  return tok.access_token;
}

async function gscFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`GSC ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function discoverProperty(token) {
  const data = await gscFetch(`${GSC_BASE}/sites`, token);
  const entries = data.siteEntry || [];
  if (entries.length === 0) {
    console.error("Service account sees no Search Console properties.");
    console.error("Add it under property Settings > Users and permissions, then retry.");
    process.exit(1);
  }
  const preferred = entries.find((e) => e.siteUrl?.includes("osakacastletours"));
  return (preferred || entries[0]).siteUrl;
}

function isoDaysAgo(n) {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function classifyPage(page) {
  if (/\/ja\/education/.test(page)) return "jaEducation";
  if (/\/ja\//.test(page)) return "jaOther";
  if (/\/education/.test(page)) return "enEducation";
  return "other";
}

function bucketize(rows) {
  const buckets = {};
  const newBucket = () => ({ pages: new Set(), impressions: 0, clicks: 0, posWeighted: 0 });
  for (const row of rows) {
    const page = row.keys[row.keys.length - 1];
    const query = row.keys.length > 1 ? row.keys[0] : "(total)";
    const name = classifyPage(page);
    if (!buckets[name]) buckets[name] = { ...newBucket(), queries: [] };
    const b = buckets[name];
    b.pages.add(page);
    b.impressions += row.impressions || 0;
    b.clicks += row.clicks || 0;
    b.posWeighted += (row.position || 0) * (row.impressions || 0);
    if (row.impressions > 0) b.queries.push({ query, impressions: row.impressions, clicks: row.clicks || 0 });
  }
  for (const b of Object.values(buckets)) {
    b.pageCount = b.pages.size;
    delete b.pages;
    b.avgPosition = b.impressions > 0 ? Math.round((b.posWeighted / b.impressions) * 10) / 10 : null;
    delete b.posWeighted;
    b.queries.sort((x, y) => y.impressions - x.impressions);
    b.topQueries = b.queries.slice(0, 10);
    delete b.queries;
  }
  return buckets;
}

function totals(rows) {
  let impressions = 0, clicks = 0, posWeighted = 0;
  for (const row of rows) {
    impressions += row.impressions || 0;
    clicks += row.clicks || 0;
    posWeighted += (row.position || 0) * (row.impressions || 0);
  }
  return {
    impressions,
    clicks,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : null,
    avgPosition: impressions > 0 ? Math.round((posWeighted / impressions) * 10) / 10 : null,
  };
}

async function inspectUrls(token, property, urls) {
  const out = [];
  for (const url of urls) {
    try {
      const res = await fetch(INSPECT_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionUrl: url, siteUrl: property, languageCode: "en-US" }),
      });
      const text = await res.text();
      let body = null;
      try {
        body = JSON.parse(text);
      } catch {
        body = null;
      }
      const s = body?.inspectionResult?.indexStatusResult;
      if (!res.ok || !s) {
        out.push({
          url,
          verdict: `HTTP ${res.status}`,
          detail: body?.error?.message || text.slice(0, 120) || "empty response",
        });
        continue;
      }
      out.push({
        url,
        verdict: s.verdict || "UNKNOWN",
        coverageState: s.coverageState || null,
        lastCrawlTime: s.lastCrawlTime || null,
      });
    } catch (e) {
      out.push({ url, verdict: "ERROR", detail: e.message });
    }
  }
  return out;
}

function fmt(n) {
  return n === null || n === undefined ? "—" : String(n);
}

function printMarkdown({ property, startDate, endDate, totals: t, buckets, sitemaps, inspections }) {
  const line = (label, value) => `| ${label} | ${value} |`;
  console.log("");
  console.log(`## Search Console — ${startDate} → ${endDate} (${property})`);
  console.log("");
  console.log("| Metric | Value |");
  console.log("|---|---|");
  console.log(line("Total impressions (28d)", fmt(t.impressions)));
  console.log(line("Total clicks (28d)", fmt(t.clicks)));
  console.log(line("CTR / avg position", `${fmt(t.ctr)}% / ${fmt(t.avgPosition)}`));
  const ja = buckets.jaOther, je = buckets.jaEducation, ee = buckets.enEducation;
  console.log(line("JA pages with impressions (/ja/*)", fmt((ja?.pageCount ?? 0) + (je?.pageCount ?? 0))));
  console.log(line("JA chronicles (/ja/*.html, excl. education)", fmt(ja?.pageCount ?? 0)));
  console.log(line("/ja/education* pages with impressions", fmt(je?.pageCount ?? 0)));
  console.log(line("JA education impressions / clicks / position", `${fmt(je?.impressions ?? 0)} / ${fmt(je?.clicks ?? 0)} / ${fmt(je?.avgPosition)}`));
  console.log(line("EN /education impressions / clicks / position", `${fmt(ee?.impressions ?? 0)} / ${fmt(ee?.clicks ?? 0)} / ${fmt(ee?.avgPosition)}`));
  const q = (label, b) => {
    if (!b || b.topQueries.length === 0) return `_${label}: none_`;
    return `**${label}:** ` + b.topQueries.slice(0, 5).map((x) => `${x.query} (${x.impressions})`).join(" · ");
  };
  console.log("");
  console.log(q("Top JA education queries", je));
  console.log(q("Top EN education queries", ee));
  console.log("");
  for (const s of sitemaps) {
    console.log(`Sitemap: ${s.path} (submitted ${fmt(s.lastSubmitted)})`);
  }
  if (inspections) {
    console.log("");
    console.log("### URL inspection");
    for (const i of inspections) {
      console.log(
        `- ${i.verdict} — ${i.url}${i.coverageState ? ` (${i.coverageState})` : ""}${i.detail ? ` — ${i.detail}` : ""}`
      );
    }
  }
  console.log("");
}

async function main() {
  loadDotEnv();
  const inspect = process.argv.includes("--inspect");
  const keyJson = loadServiceAccount();
  const token = await getAccessToken(keyJson, SCOPE);
  const property = await discoverProperty(token);
  const encoded = encodeURIComponent(property);

  const endDate = isoDaysAgo(1);
  const startDate = isoDaysAgo(28);

  const analytics = await gscFetch(
    `${GSC_BASE}/sites/${encoded}/searchAnalytics/query`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["query", "page"],
        rowLimit: 25000,
      }),
    }
  );
  const rows = analytics.rows || [];
  const t = totals(rows);
  const buckets = bucketize(rows);

  const sm = await gscFetch(`${GSC_BASE}/sites/${encoded}/sitemaps`, token);
  const sitemaps = sm.sitemap || [];

  let inspections = null;
  if (inspect) {
    const origin = property.startsWith("sc-domain:")
      ? "https://osakacastletours.com"
      : property.replace(/\/$/, "");
    const pages = [...new Set(rows.map((r) => r.keys[r.keys.length - 1]))];
    const pick = (fn) => pages.find(fn);
    const urls = [
      `${origin}/`,
      `${origin}/education`,
      pick((p) => /\/ja\/education/.test(p)),
      pick((p) => /\/ja\//.test(p) && !/\/ja\/education/.test(p)),
      pick((p) => !/\/ja\/|\/education/.test(p)),
      ].filter(Boolean);
      inspections = await inspectUrls(token, property, [...new Set(urls)].slice(0, 5));
    }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    property,
    window: { startDate, endDate },
    totals: t,
    buckets,
    sitemaps,
    inspections,
  };
  const outDir = path.join(process.cwd(), "data/search");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `gsc-${endDate}.json`);
  fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2) + "\n");

  printMarkdown({ property, startDate, endDate, totals: t, buckets, sitemaps, inspections });
  console.log(`Snapshot: ${path.relative(process.cwd(), outFile)}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
