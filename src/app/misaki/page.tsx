import type { Metadata } from "next";
import { getPartner } from "@/config/referral-partners";
import { sanitizeStaffName } from "@/lib/referral/misaki";
import { fetchFlagshipTour } from "@/lib/referral/tour";
import { ReferralLanding } from "@/components/referral/ReferralLanding";

// Legacy /misaki URL (already shared with KIMONO RENTAL MISAKI) — thin
// wrapper over the shared referral landing, typed-staff mode. The canonical
// partner URL is /ref/misaki; both stay live. Deliberately no SEO treatment.
export const metadata: Metadata = {
  title: "Osaka Castle Tour — Recommended by KIMONO RENTAL MISAKI",
  robots: { index: false, follow: false },
};

export default async function MisakiPage({
  searchParams,
}: {
  searchParams: Promise<{ staff?: string }>;
}) {
  const params = await searchParams;
  const initialStaff =
    typeof params.staff === "string" ? sanitizeStaffName(params.staff) : null;

  const partner = getPartner("misaki")!;
  const tour = await fetchFlagshipTour();

  return (
    <ReferralLanding tour={tour} partner={partner} initialStaff={initialStaff} />
  );
}
