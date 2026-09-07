import { NextResponse } from "next/server";

const SANDBOX_BASE = "https://supplier-api.getyourguide.com/sandbox/1";

function getAuth(): string {
  const username = process.env.GYG_USERNAME;
  const password = process.env.GYG_PASSWORD;
  if (!username || !password) throw new Error("Missing GYG_USERNAME or GYG_PASSWORD");
  return Buffer.from(`${username}:${password}`).toString("base64");
}

async function gzgFetch(path: string, init?: RequestInit) {
  const auth = getAuth();
  return fetch(`${SANDBOX_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      ...init?.headers,
    },
  });
}

export async function POST() {
  const results: Record<string, unknown> = {};

  // 1. CREATE a deal
  const createBody = {
    data: {
      externalProductId: "T-1221780",
      dealName: "Test Last Minute Deal",
      dateRange: {
        start: "2026-09-10",
        end: "2026-09-30",
      },
      dealType: "last_minute",
      maxVacancies: 10,
      discountPercentage: 10.5,
      noticePeriodDays: 3,
    },
  };

  try {
    const createRes = await gzgFetch("/deals", {
      method: "POST",
      body: JSON.stringify(createBody),
    });
    const createText = await createRes.text();
    let createJson: unknown;
    try { createJson = JSON.parse(createText); } catch { createJson = createText; }
    results.create = { status: createRes.status, body: createJson };
  } catch (e) {
    results.create = { error: e instanceof Error ? e.message : String(e) };
  }

  // 2. LIST deals
  try {
    const listRes = await gzgFetch("/deals?externalProductId=T-1221780");
    const listText = await listRes.text();
    let listJson: unknown;
    try { listJson = JSON.parse(listText); } catch { listJson = listText; }
    results.list = { status: listRes.status, body: listJson };

    // Extract dealId from create response for deletion
    let dealId: number | null = null;
    const createResult = results.create as { body?: { deals?: { dealId: number }[] } };
    if (createResult.body?.deals?.[0]?.dealId) {
      dealId = createResult.body.deals[0].dealId;
    }

    // 3. DELETE the deal
    if (dealId) {
      try {
        const deleteRes = await gzgFetch(`/deals/${dealId}`, { method: "DELETE" });
        results.delete = { status: deleteRes.status, body: deleteRes.status === 204 ? "No Content" : await deleteRes.text() };
      } catch (e) {
        results.delete = { error: e instanceof Error ? e.message : String(e) };
      }
    } else {
      results.delete = { skipped: "No dealId from create response" };
    }
  } catch (e) {
    results.list = { error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json(results);
}
