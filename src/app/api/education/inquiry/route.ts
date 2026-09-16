import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/client";
import { educationInquiryEmail } from "@/lib/email/education-inquiry";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";

export async function POST(request: NextRequest) {
  // Rate limit: 5 per IP per hour
  const rl = rateLimit(`edu-inquiry:${clientIp(request)}`, 5);
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
  const schoolName =
    typeof body.schoolName === "string" ? body.schoolName.trim() : "";
  const contactName =
    typeof body.contactName === "string" ? body.contactName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim() : "";
  const schoolType =
    typeof body.schoolType === "string" ? body.schoolType.trim() : "";
  const classSize =
    typeof body.classSize === "string" ? body.classSize.trim() : "";
  const language =
    typeof body.language === "string" ? body.language.trim() : "";

  if (!schoolName || !contactName || !email || !schoolType || !classSize || !language) {
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

  const subject =
    typeof body.subject === "string" ? body.subject.trim() : null;
  const angle = typeof body.angle === "string" ? body.angle.trim() : null;
  const phone = typeof body.phone === "string" ? body.phone.trim() : null;
  const materials = Array.isArray(body.materials)
    ? body.materials.filter((m): m is string => typeof m === "string")
    : [];
  const preferredDates =
    typeof body.dates === "string" ? body.dates.trim() : null;
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;
  const locale = typeof body.locale === "string" ? body.locale : "en";

  const supabase = createServiceClient();

  // Save to database
  const { error: dbError } = await supabase.from("education_inquiries").insert({
    school_name: schoolName,
    contact_name: contactName,
    email,
    phone,
    subject,
    angle,
    school_type: schoolType,
    class_size: classSize,
    language,
    materials,
    preferred_dates: preferredDates,
    notes,
    locale,
    status: "new",
  });

  if (dbError) {
    console.error("[Education Inquiry] DB error:", dbError);
    return NextResponse.json(
      { error: "Failed to save inquiry" },
      { status: 500 }
    );
  }

  // Send email notification
  const emailContent = educationInquiryEmail({
    schoolName,
    contactName,
    email,
    phone: phone ?? undefined,
    subject: subject ?? undefined,
    angle: angle ?? undefined,
    schoolType,
    classSize,
    language,
    materials,
    preferredDates: preferredDates ?? undefined,
    notes: notes ?? undefined,
    locale,
  });

  await sendEmail({
    to: "edward@osakacastletours.com",
    subject: emailContent.subject,
    html: emailContent.html,
  }).catch((e) => console.error("[Education Inquiry] Email failed:", e));

  return NextResponse.json({ ok: true });
}
