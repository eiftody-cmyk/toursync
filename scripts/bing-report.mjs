#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const BING_BASE = "https://ssl.bing.com/webmaster/api.svc/json";

function loadDotEnv() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

async function bingGet(method, params) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${BING_BASE}/${method}?${qs}`);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Bing ${method} ${res.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text);
}

function unwrap(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.d)) return body.d;
  return body ? [body] : [];
}

function findSiteUrl(sites) {
  for (const s of sites) {
    for (const v of Object.values(s)) {
      if (typeof v === "string" && v.includes("osakacastletours")) return v;
    }
  }
  const first = sites[0] || {};
  for (const key of ["Url", "SiteUrl", "siteUrl", "url"]) {
    if (typeof first[key] === "string") return first[key];
  }
  return null;
}

function parseBingDate(v) {
  if (typeof v === "string") {
    const m = v.match(/\/Date\((\d+)/);
    if (m) return new Date(Number(m[1]));
    const d = new Date(v);
    if (!isNaN(d)) return d;
  }
  if (typeof v === "number") return new Date(v);
  return null;
}

function pickField(obj, re) {
  for (const [k, v] of Object.entries(obj)) {
    if (re.test(k)) return v;
  }
  return null;
}

function fmt(n) {
  return n === null || n === undefined ? "—" : String(n);
}

async function main() {
  loadDotEnv();
  const apiKey = (process.env.BING_WEBMASTER_API_KEY || "").trim();
  if (!apiKey) {
    console.error("BING_WEBMASTER_API_KEY missing — add it to .env.local.");
    console.error("Get it from Bing Webmaster Tools > Settings > API access > Generate API Key.");
    process.exit(1);
  }

  const sites = unwrap(await bingGet("GetUserSites", { apikey: apiKey }));
  const siteUrl = findSiteUrl(sites);
  if (!siteUrl) {
    console.error("No osakacastletours site found in GetUserSites response:");
    console.error(JSON.stringify(sites, null, 1).slice(0, 800));
    process.exit(1);
  }

  const cutoff = Date.now() - 28 * 24 * 60 * 60 * 1000;
  const traffic = unwrap(await bingGet("GetRankAndTrafficStats", { apikey: apiKey, siteUrl }));
  let impressions = 0, clicks = 0, days = 0;
  for (const row of traffic) {
    const d = parseBingDate(row.Date);
    if (d && d.getTime() >= cutoff) {
      impressions += Number(row.Impressions) || 0;
      clicks += Number(row.Clicks) || 0;
      days += 1;
    }
  }

  const queryRows = unwrap(await bingGet("GetQueryStats", { apikey: apiKey, siteUrl }));
  const queries = queryRows
    .map((r) => ({
      query: fmt(pickField(r, /keyword|query/i)),
      impressions: Number(pickField(r, /impression/i)) || 0,
      clicks: Number(pickField(r, /click/i)) || 0,
    }))
    .filter((r) => r.query !== "—" && r.impressions > 0)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);

  const snapshot = {
    generatedAt: new Date().toISOString(),
    siteUrl,
    window: { last28Days: true, daysWithData: days },
    totals: { impressions, clicks },
    topQueries: queries,
  };
  const outDir = path.join(process.cwd(), "data/search");
  fs.mkdirSync(outDir, { recursive: true });
  const outName = `bing-${new Date().toISOString().slice(0, 10)}.json`;
  const outFile = path.join(outDir, outName);
  fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2) + "\n");

  console.log("");
  console.log(`## Bing Webmaster — last 28 days (${siteUrl})`);
  console.log("");
  console.log("| Metric | Value |");
  console.log("|---|---|");
  console.log(`| Impressions (28d) | ${fmt(impressions)} |`);
  console.log(`| Clicks (28d) | ${fmt(clicks)} |`);
  console.log(`| Days with data | ${fmt(days)} |`);
  console.log("");
  if (queries.length > 0) {
    console.log("**Top queries:** " + queries.map((q) => `${q.query} (${q.impressions})`).join(" · "));
  } else {
    console.log("_No query data returned._");
  }
  console.log("");
  console.log(`Snapshot: ${path.relative(process.cwd(), outFile)}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
