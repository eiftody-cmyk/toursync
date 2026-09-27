import { createClient } from "@/lib/supabase/server";
import { MisakiLandingClient } from "./MisakiLandingClient";
import type { Metadata } from "next";

// Conversion page for KIMONO RENTAL MISAKI referrals (QR code in shop).
// Deliberately no SEO treatment: noindex, not in sitemap, no metadata tuning.
export const metadata: Metadata = {
  title: "Osaka Castle Tour — Recommended by KIMONO RENTAL MISAKI",
  robots: { index: false, follow: false },
};

// The flagship 2.5-hour tour already positioned for Shōgun-series viewers.
const TOUR_ID = "c97d74f3-c95a-451f-aa1a-e34452b3e592";

const FALLBACK_TOUR = {
  id: TOUR_ID,
  name: "Osaka Castle: Warrior Monks, a Peasant, and a Shogun",
  description:
    "An Osaka Castle Park tour for Shogun-series fans looking for accurate, accessible history.",
  price: 9500,
  currency: "JPY",
  capacity: 6,
  meeting_point_address:
    "2-3-6 Tanimachi, Chuo-ku, Osaka - There is a CoCo Curry House restaurant on the ground floor.",
};

export default async function MisakiPage({
  searchParams,
}: {
  searchParams: Promise<{ staff?: string }>;
}) {
  const params = await searchParams;
  const initialStaff =
    typeof params.staff === "string" ? params.staff.slice(0, 40) : null;

  let tour: typeof FALLBACK_TOUR = FALLBACK_TOUR;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tours")
      .select(
        "id, name, description, price, currency, capacity, meeting_point_address"
      )
      .eq("id", TOUR_ID)
      .single();
    if (data) tour = data;
  } catch {
    // fall back to the static copy above
  }

  return <MisakiLandingClient tour={tour} initialStaff={initialStaff} />;
}
