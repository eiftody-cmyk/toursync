import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/client";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";
import { bookingConfirmationEmail } from "@/lib/email/booking-confirmation";
import { operatorNotificationEmail } from "@/lib/email/operator-notification";
import { customTimeNotificationEmail } from "@/lib/email/custom-time-notification";

// --- PayPal webhook signature verification (Web Crypto, Worker-safe) ---
// PayPal signs webhook payloads with ES256 (ECDSA-P256-SHA256) and publishes the
// public key in the PEGA certificate at PAYPAL-CERT-URL. We fetch the cert, extract
// the SubjectPublicKeyInfo, and verify the JWS signature over the exact request body.

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

// Extract SubjectPublicKeyInfo (SPKI) DER from an X.509 certificate DER.
// Certificate ::= SEQUENCE { tbsCertificate SEQUENCE { ..., subjectPublicKeyInfo SEQUENCE } }
// Within tbsCertificate, the SPKI is the SEQUENCE whose value starts with an
// AlgorithmIdentifier (SEQUENCE) followed by a BIT STRING.
// Returns the raw DER of the SPKI SEQUENCE (including its tag+length prefix).
function extractSpki(certDer: Uint8Array): Uint8Array {
  const outer = readTlv(certDer, 0);
  if (outer.tag !== 0x30) throw new Error("Invalid certificate: no outer SEQUENCE");

  const tbs = readTlv(certDer, outer.valueStart);
  if (tbs.tag !== 0x30) throw new Error("Invalid certificate: no tbsCertificate");

  // Walk the top-level TLVs of tbsCertificate looking for the SPKI structure.
  let p = tbs.valueStart;
  const tbsEnd = tbs.next;
  while (p < tbsEnd) {
    const tlv = readTlv(certDer, p);
    if (tlv.tag === 0x30) {
      // Candidate SEQUENCE — is its value an AlgorithmIdentifier + BIT STRING?
      const alg = readTlv(certDer, tlv.valueStart);
      const bitStr = readTlv(certDer, alg.next);
      if (alg.tag === 0x30 && bitStr.tag === 0x03 && bitStr.next === tlv.next) {
        // SPKI confirmed; return the whole SEQUENCE DER including prefix
        return certDer.slice(p, tlv.next);
      }
    }
    p = tlv.next;
  }
  throw new Error("Invalid certificate: no SubjectPublicKeyInfo found");
}

// Convert a DER-encoded ECDSA signature (r,s INTEGERs) to raw r||s format,
// which is what WebCrypto's ECDSA verify expects.
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

  const isRsa =
    algorithm.toLowerCase().includes("sha256withrsa") || algorithm.toLowerCase().includes("rs256");

  try {
    const spkiRaw = extractSpki(pemToDer(certPem));
    const spki = spkiRaw.buffer.slice(spkiRaw.byteOffset, spkiRaw.byteOffset + spkiRaw.byteLength) as ArrayBuffer;

    let key: CryptoKey;
    let ok: boolean;
    const sigDecoded = new Uint8Array(atob(pad(b64url(signature))).split("").map((c) => c.charCodeAt(0)));

    // WebCrypto types require ArrayBuffer-backed buffers.
    const bodyBuf = bodyBytes.buffer.slice(
      bodyBytes.byteOffset,
      bodyBytes.byteOffset + bodyBytes.byteLength
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
        bodyBuf
      );
    } else {
      key = await crypto.subtle.importKey(
        "spki",
        spki,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"]
      );
      // PayPal ECDSA signatures can be DER-encoded or raw r||s (JWS). Normalize both.
      const rawSig =
        sigDecoded.length === 64
          ? sigDecoded
          : derEcdsaToRaw(sigDecoded, 64);
      const sigBuf = rawSig.buffer.slice(rawSig.byteOffset, rawSig.byteOffset + rawSig.byteLength) as ArrayBuffer;
      ok = await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        key,
        sigBuf,
        bodyBuf
      );
    }

    return ok ? { ok: true } : { ok: false, reason: "signature mismatch" };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? `verify threw: ${e.message}` : "verify threw" };
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // PayPal itself rate-limits retries; cap per-IP flood attempts.
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
    // 201 halts PayPal's automatic retries for an invalid event
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

  // Parse custom_id: tour_id|date|start_time|guest_count[|custom=true|customer_phone]
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

  const paypalOrderId = body?.resource?.id;

  // Dedup: if a booking already references this PayPal capture, skip — the
  // capture-order route already created it. Guards against doubled deliveries.
  if (paypalOrderId) {
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .ilike("notes", `%${paypalOrderId}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`[PayPal webhook] Duplicate event for order ${paypalOrderId} — skipping`);
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
      notes: isCustomTime
        ? JSON.stringify({
            custom_time: true,
            customer_phone: customerPhone,
            paypal_order: body?.resource?.id ?? "unknown",
          })
        : `PayPal order: ${body?.resource?.id ?? "unknown"}`,
    })
    .select("id")
    .single();

  if (error) {
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