import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/client";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";
import { bookingConfirmationEmail } from "@/lib/email/booking-confirmation";
import { operatorNotificationEmail } from "@/lib/email/operator-notification";
import { customTimeNotificationEmail } from "@/lib/email/custom-time-notification";

// --- PayPal webhook signature verification ---
// PayPal signs: transmissionId|timeStamp|webhookId|crc32(body)
// We verify the signature over this canonical string using the cert from paypal-cert-url.

const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID ?? "";

// CRC32 lookup table (IEEE 802.3 polynomial)
const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table[i] = c;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = crc32Table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const b64url = (s: string) => s.replace(/-/g, "+").replace(/_/g, "/");
const pad = (s: string) => s + "=".repeat((4 - (s.length % 4)) % 4);

function pemToDer(pem: string): Uint8Array {
  const b64 = pem
    .replace(/-----BEGIN CERTIFICATE-----/g, "")
    .replace(/-----END CERTIFICATE-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function readTlv(bytes: Uint8Array, start: number): { tag: number; length: number; valueStart: number; next: number } {
  const tag = bytes[start];
  let p = start + 1;
  const first = bytes[p];
  p += 1;
  let length: number;
  if ((first & 0x80) === 0) {
    length = first;
  } else {
    const numBytes = first & 0x7f;
    length = 0;
    for (let i = 0; i < numBytes; i++) length = (length << 8) | bytes[p + i];
    p += numBytes;
  }
  return { tag, length, valueStart: p, next: p + length };
}

function extractSpki(certDer: Uint8Array): Uint8Array {
  const outer = readTlv(certDer, 0);
  if (outer.tag !== 0x30) throw new Error("Invalid certificate: no outer SEQUENCE");

  const tbs = readTlv(certDer, outer.valueStart);
  if (tbs.tag !== 0x30) throw new Error("Invalid certificate: no tbsCertificate");

  let p = tbs.valueStart;
  const tbsEnd = tbs.next;
  while (p < tbsEnd) {
    const tlv = readTlv(certDer, p);
    if (tlv.tag === 0x30) {
      const alg = readTlv(certDer, tlv.valueStart);
      const bitStr = readTlv(certDer, alg.next);
      if (alg.tag === 0x30 && bitStr.tag === 0x03 && bitStr.next === tlv.next) {
        return certDer.slice(p, tlv.next);
      }
    }
    p = tlv.next;
  }
  throw new Error("Invalid certificate: no SubjectPublicKeyInfo found");
}

function derEcdsaToRaw(der: Uint8Array, rawLen: number): Uint8Array {
  let p = 0;
  if (der[p++] !== 0x30) throw new Error("ECDSA sig: no SEQUENCE");
  const seqLen = der[p++];
  p += seqLen & 0x80 ? seqLen & 0x7f : 0;

  const ints: Uint8Array[] = [];
  for (let i = 0; i < 2; i++) {
    if (der[p++] !== 0x02) throw new Error("ECDSA sig: no INTEGER");
    let l = der[p++];
    if (l & 0x80) {
      const n = l & 0x7f;
      l = 0;
      for (let j = 0; j < n; j++) l = (l << 8) | der[p++];
    }
    let v = der.subarray(p, p + l);
    p += l;
    while (v.length > 1 && v[0] === 0) v = v.subarray(1);
    ints.push(v);
  }

  const raw = new Uint8Array(rawLen);
  ints.forEach((v, i) => raw.set(v, 32 - v.length + i * 32));
  return raw;
}

async function verifyWebhookSignature(
  bodyBytes: Uint8Array,
  headers: Headers
): Promise<{ ok: boolean; reason?: string }> {
  const certUrl = headers.get("paypal-cert-url");
  const signature = headers.get("paypal-transmission-sig");
  const algorithm = headers.get("paypal-auth-algo") ?? "";
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");

  if (!certUrl || !signature || !transmissionId || !transmissionTime) {
    return { ok: false, reason: "missing transmission headers" };
  }

  if (!WEBHOOK_ID) {
    return { ok: false, reason: "PAYPAL_WEBHOOK_ID not configured" };
  }

  // Validate cert URL is from PayPal
  let certHost: URL;
  try {
    certHost = new URL(certUrl);
  } catch {
    return { ok: false, reason: "invalid cert URL" };
  }
  if (!certHost.hostname.endsWith(".paypal.com") && certHost.hostname !== "paypal.com") {
    return { ok: false, reason: "cert URL not from paypal.com" };
  }

  // Reject stale transmissions (skew > 5 minutes)
  const skewMs = Math.abs(Date.now() - Date.parse(transmissionTime));
  if (Number.isNaN(skewMs) || skewMs > 5 * 60 * 1000) {
    return { ok: false, reason: "stale transmission time" };
  }

  let certPem: string;
  try {
    const res = await fetch(certUrl, { cache: "no-store" });
    if (!res.ok) return { ok: false, reason: "cert fetch failed" };
    certPem = await res.text();
  } catch {
    return { ok: false, reason: "cert fetch threw" };
  }

  // Build the canonical message: transmissionId|timeStamp|webhookId|crc32
  const bodyCrc = crc32(bodyBytes);
  const canonicalMessage = `${transmissionId}|${transmissionTime}|${WEBHOOK_ID}|${bodyCrc}`;
  const messageBytes = new TextEncoder().encode(canonicalMessage);

  const isRsa =
    algorithm.toLowerCase().includes("sha256withrsa") || algorithm.toLowerCase().includes("rs256");

  try {
    const spkiRaw = extractSpki(pemToDer(certPem));
    const spki = spkiRaw.buffer.slice(spkiRaw.byteOffset, spkiRaw.byteOffset + spkiRaw.byteLength) as ArrayBuffer;

    let key: CryptoKey;
    let ok: boolean;
    const sigDecoded = new Uint8Array(atob(pad(b64url(signature))).split("").map((c) => c.charCodeAt(0)));

    const msgBuf = messageBytes.buffer.slice(
      messageBytes.byteOffset,
      messageBytes.byteOffset + messageBytes.byteLength
    ) as ArrayBuffer;

    if (isRsa) {
      key = await crypto.subtle.importKey(
        "spki",
        spki,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      );
      ok = await crypto.subtle.verify(
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        key,
        sigDecoded,
        msgBuf
      );
    } else {
      key = await crypto.subtle.importKey(
        "spki",
        spki,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"]
      );
      const rawSig =
        sigDecoded.length === 64
          ? sigDecoded
          : derEcdsaToRaw(sigDecoded, 64);
      const sigBuf = rawSig.buffer.slice(rawSig.byteOffset, rawSig.byteOffset + rawSig.byteLength) as ArrayBuffer;
      ok = await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        key,
        sigBuf,
        msgBuf
      );
    }

    return ok ? { ok: true } : { ok: false, reason: "signature mismatch" };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? `verify threw: ${e.message}` : "verify threw" };
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const ip = clientIp(req);
  const rl = rateLimit(`webhook:${ip}`, 30);
  if (!rl.ok) {
    return NextResponse.json({ ok: true, skipped: "rate limited" }, { status: 201 });
  }

  let body: {
    event_type?: string;
    resource?: {
      id?: string;
      custom_id?: string;
      payer?: {
        email_address?: string;
        name?: { given_name?: string; surname?: string };
      };
      supplementary_data?: {
        related_ids?: {
          order_id?: string;
        };
      };
    } | null;
  };
  try {
    body = JSON.parse(rawBody) as typeof body;
  } catch {
    return NextResponse.json({ ok: true, skipped: "invalid json" }, { status: 201 });
  }

  const signatureValid = await verifyWebhookSignature(
    new TextEncoder().encode(rawBody),
    req.headers
  );

  if (!signatureValid.ok) {
    console.warn("[PayPal webhook] Signature verification failed:", signatureValid.reason);
    return NextResponse.json({ ok: true, skipped: "invalid signature" }, { status: 201 });
  }

  const eventType = body?.event_type;
  if (eventType !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const resource = body?.resource;
  if (!resource) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const customId = resource?.custom_id;
  if (!customId) {
    console.error("[PayPal webhook] No custom_id in resource");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const parts = customId.split("|");
  if (parts.length < 4) {
    console.error("[PayPal webhook] Invalid custom_id format:", customId);
    return NextResponse.json({ ok: true, skipped: true });
  }

  const [tourId, date, startTime, guestCountStr, customFlag] = parts;
  const guestCount = parseInt(guestCountStr, 10);
  const isCustomTime = customFlag === "custom=true";
  const customerPhone = isCustomTime && parts[5] ? decodeURIComponent(parts[5]) : null;

  if (!tourId || !date || !guestCount || guestCount < 1) {
    console.error("[PayPal webhook] Invalid booking data:", customId);
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = createServiceClient();
  const captureId = body?.resource?.id;

  // Dedup: check both paypal_order_id and paypal_capture_id to prevent duplicates
  // The capture-order route stores orderId in paypal_order_id;
  // this webhook fires with captureId. Either path may create the booking first.
  if (captureId) {
    const { data: existingCapture } = await supabase
      .from("bookings")
      .select("id")
      .eq("paypal_capture_id", captureId)
      .limit(1);

    if (existingCapture && existingCapture.length > 0) {
      console.log(`[PayPal webhook] Duplicate event for capture ${captureId} — skipping`);
      return NextResponse.json({ ok: true, skipped: "duplicate" });
    }
  }

  // Also check if a booking exists with the related order ID (capture-order may have created it)
  const relatedOrderId = body?.resource?.supplementary_data?.related_ids?.order_id;
  if (relatedOrderId) {
    const { data: existingOrder } = await supabase
      .from("bookings")
      .select("id")
      .eq("paypal_order_id", relatedOrderId)
      .limit(1);

    if (existingOrder && existingOrder.length > 0) {
      console.log(`[PayPal webhook] Duplicate event for order ${relatedOrderId} — skipping`);
      return NextResponse.json({ ok: true, skipped: "duplicate" });
    }
  }

  const { data: tour } = await supabase
    .from("tours")
    .select("user_id, name, price, currency")
    .eq("id", tourId)
    .single();

  if (!tour) {
    console.error("[PayPal webhook] Tour not found:", tourId);
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { data: operatorProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", tour.user_id)
    .single();

  const payerEmail = resource?.payer?.email_address ?? null;
  const payerName = resource?.payer?.name?.given_name
    ? `${resource.payer.name.given_name} ${resource.payer.name.surname ?? ""}`.trim()
    : null;

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      tour_id: tourId,
      user_id: tour.user_id,
      date,
      start_time: startTime || null,
      guest_count: guestCount,
      source: isCustomTime ? "direct-custom" : "direct",
      customer_name: payerName ?? payerEmail,
      customer_email: payerEmail,
      paypal_order_id: relatedOrderId ?? null,
      paypal_capture_id: captureId ?? null,
      notes: isCustomTime
        ? JSON.stringify({
            custom_time: true,
            customer_phone: customerPhone,
            paypal_order: relatedOrderId ?? "unknown",
          })
        : `PayPal order: ${relatedOrderId ?? "unknown"}`,
    })
    .select("id")
    .single();

  if (error) {
    // P23505 = unique_violation — race condition with capture-order creating same booking
    if (error.code === "23505") {
      console.log(`[PayPal webhook] Race condition dedup for capture ${captureId}`);
      return NextResponse.json({ ok: true, skipped: "race-condition-dedup" });
    }
    console.error("[PayPal webhook] Failed to create booking:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://osakacastletours.com";

  if (isCustomTime) {
    if (operatorProfile?.email) {
      const notificationEmail = customTimeNotificationEmail({
        tourName: tour.name,
        date,
        startTime: startTime || "TBD",
        guestCount,
        customerName: payerName ?? "Unknown",
        customerEmail: payerEmail ?? "unknown",
        customerPhone,
        baseUrl,
      });

      sendEmail({
        to: operatorProfile.email,
        subject: notificationEmail.subject,
        html: notificationEmail.html,
      }).catch((e) => console.error("[PayPal webhook] Custom time notification email failed:", e));
    }
  } else {
    if (payerEmail && tour.price) {
      const confirmationEmail = bookingConfirmationEmail({
        tourName: tour.name,
        date,
        startTime,
        guestCount,
        currency: tour.currency || "JPY",
        pricePerGuest: tour.price,
        bookingId: booking.id,
        baseUrl,
      });

      sendEmail({
        to: payerEmail,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
      }).catch((e) => console.error("[PayPal webhook] Confirmation email failed:", e));
    }

    if (operatorProfile?.email) {
      const notificationEmail = operatorNotificationEmail({
        operatorEmail: operatorProfile.email,
        tourName: tour.name,
        date,
        startTime,
        guestCount,
        customerName: payerName,
        customerEmail: payerEmail,
        baseUrl,
      });

      sendEmail({
        to: notificationEmail.to,
        subject: notificationEmail.subject,
        html: notificationEmail.html,
      }).catch((e) => console.error("[PayPal webhook] Operator notification email failed:", e));
    }
  }

  const guestWord = guestCount === 1 ? "guest" : "guests";
  supabase
    .from("notifications")
    .insert({
      user_id: tour.user_id,
      type: "new_booking",
      title: `New Booking — ${tour.name}`,
      message: `${guestCount} ${guestWord} on ${date}${startTime ? ` at ${startTime}` : ""}`,
      link: "/dashboard",
    })
    .then(({ error: notifError }) => {
      if (notifError) console.error("[PayPal webhook] Notification insert failed:", notifError.message);
    });

  if (!isCustomTime) {
    const { data: tourCap } = await supabase
      .from("tours")
      .select("capacity")
      .eq("id", tourId)
      .single();

    const { data: allBookings } = await supabase
      .from("bookings")
      .select("guest_count")
      .eq("tour_id", tourId)
      .eq("date", date)
      .eq("start_time", startTime || null)
      .eq("status", "confirmed");

    const totalBooked = (allBookings ?? []).reduce((sum, b) => sum + (b.guest_count ?? 0), 0);

    if (tourCap && totalBooked >= tourCap.capacity) {
      try {
        await fetch(`${baseUrl}/api/calendar/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tour_id: tourId,
            date,
            start_time: startTime || null,
            reason: "Full — via PayPal booking",
          }),
        });
      } catch (e) {
        console.error("[PayPal webhook] Auto-block failed:", e);
      }
    }
  }

  console.log(`[PayPal webhook] Booking created: ${tourId} on ${date} for ${guestCount} guests${isCustomTime ? " (custom time)" : ""}`);
  return NextResponse.json({ ok: true });
}
