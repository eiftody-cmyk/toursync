import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseReferralSlug } from "@/config/referral-partners";
import { createServiceClient } from "@/lib/supabase/service";
import { sanitizeStaffName } from "@/lib/referral/misaki";
import { findStaffBySlug } from "@/lib/referral/staff";
import { fetchFlagshipTour } from "@/lib/referral/tour";
import {
  ReferralLanding,
  type RegisteredStaff,
} from "@/components/referral/ReferralLanding";

// Referral landing pages are QR-only: noindex, never in the sitemap.
// Same conversion content for every partner/staff URL — identity comes
// from the code registry (partners) and the referral_staff table (slugs).

async function resolveStaff(
  partnerSlug: string,
  staffSlug: string
): Promise<RegisteredStaff | null> {
  try {
    const record = await findStaffBySlug(
      createServiceClient(),
      partnerSlug,
      staffSlug
    );
    return record ? { slug: record.slug, displayName: record.display_name } : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseReferralSlug(slug);
  if (!parsed) return { robots: { index: false, follow: false } };

  let who = parsed.partner.displayName;
  if (parsed.kind === "staff") {
    const staff = await resolveStaff(parsed.partner.slug, parsed.staffSlug);
    who = staff ? `${staff.displayName} · ${parsed.partner.displayName}` : parsed.staffSlug;
  }

  return {
    title: `Osaka Castle Tour — Recommended by ${who}`,
    robots: { index: false, follow: false },
  };
}

export default async function ReferralSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ staff?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const parsed = parseReferralSlug(slug);
  if (!parsed) notFound();

  const tour = await fetchFlagshipTour();

  if (parsed.kind === "staff") {
    // Registered staff QR: resolve the referral_staff row (404 on miss —
    // unknown/deleted identities never render an unregistered page; a
    // missing 033 table 404s the same way while /ref/misaki still works).
    const registeredStaff = await resolveStaff(
      parsed.partner.slug,
      parsed.staffSlug
    );
    if (!registeredStaff) notFound();

    return (
      <ReferralLanding tour={tour} partner={parsed.partner} registeredStaff={registeredStaff} />
    );
  }

  // Partner-level QR: optional ?staff= prefill, guest types the name.
  const initialStaff =
    typeof sp.staff === "string" ? sanitizeStaffName(sp.staff) : null;

  return (
    <ReferralLanding tour={tour} partner={parsed.partner} initialStaff={initialStaff} />
  );
}
