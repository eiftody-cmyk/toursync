import { NextResponse } from "next/server";

export async function POST() {
  const username = process.env.GYG_USERNAME;
  const password = process.env.GYG_PASSWORD;
  const notifyUrl = process.env.GYG_NOTIFY_URL;

  if (!username || !password || !notifyUrl) {
    return NextResponse.json(
      { error: "Missing GYG_USERNAME, GYG_PASSWORD, or GYG_NOTIFY_URL" },
      { status: 500 }
    );
  }

  const body = {
    data: {
      productId: "T-1221780",
      availabilities: [
        {
          dateTime: "2026-09-10T10:00:00+09:00",
          vacancies: 5,
        },
      ],
    },
  };

  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  try {
    const res = await fetch(notifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }

    return NextResponse.json({
      status: res.status,
      gygResponse: json,
      sentTo: notifyUrl,
      payload: body,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
