import { NextResponse } from "next/server";

export async function POST() {
  const username = process.env.GYG_USERNAME;
  const password = process.env.GYG_PASSWORD;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Missing GYG_USERNAME or GYG_PASSWORD" },
      { status: 500 }
    );
  }

  const body = {
    data: {
      externalSupplierId: "ExperienceRelay",
      firstName: "Edward",
      lastName: "Iftody",
      legalCompanyName: "Osaka Castle Walks with Edward",
      websiteUrl: "https://experiencerelay.com",
      country: "JPN",
      currency: "JPY",
      email: "edward@osakacastletours.com",
      legalStatus: "individual",
    },
  };

  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  try {
    const res = await fetch(
      "https://supplier-api.getyourguide.com/sandbox/1/suppliers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(body),
      }
    );

    const text = await res.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = text; }

    return NextResponse.json({
      status: res.status,
      gygResponse: json,
      sentTo: "https://supplier-api.getyourguide.com/sandbox/1/suppliers",
      payload: body,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
