import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/client";
import { corporateInquiryEmail } from "@/lib/email/corporate-inquiry";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";

export async function POST(request: NextRequest) {
  // Rate limit: 5 per IP per hour
  const rl = rateLimit(`corp-inquiry:${clientIp(request)}`, 5);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate required fields
  const companyName =
    typeof body.companyName === "string" ? body.companyName.trim() : "";
  const contactName =
    typeof body.contactName === "string" ? body.contactName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim() : "";
  const groupSize =
    typeof body.groupSize === "string" ? body.groupSize.trim() : "";
  const language =
    typeof body.language === "string" ? body.language.trim() : "";

  if (!companyName || !contactName || !email || !groupSize || !language) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  const preferredDates =
    typeof body.dates === "string" ? body.dates.trim() : null;
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;
  const locale = typeof body.locale === "string" ? body.locale : "en";

  const supabase = createServiceClient();

  // Save to database
  const { error: dbError } = await supabase.from("corporate_inquiries").insert({
    company_name: companyName,
    contact_name: contactName,
    email,
    group_size: groupSize,
    language,
    preferred_dates: preferredDates,
    notes,
    locale,
    status: "new",
  });

  if (dbError) {
    console.error("[Corporate Inquiry] DB error:", dbError);
    return NextResponse.json(
      { error: "Failed to save inquiry" },
      { status: 500 }
    );
  }

  // Send email notification
  const emailContent = corporateInquiryEmail({
    companyName,
    contactName,
    email,
    groupSize,
    language,
    preferredDates: preferredDates ?? undefined,
    notes: notes ?? undefined,
    locale,
  });

  await sendEmail({
    to: "edward@osakacastletours.com",
    subject: emailContent.subject,
    html: emailContent.html,
  }).catch((e) => console.error("[Corporate Inquiry] Email failed:", e));

  return NextResponse.json({ ok: true });
}
