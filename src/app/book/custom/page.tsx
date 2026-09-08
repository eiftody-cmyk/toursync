import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CustomBookingClient } from "./CustomBookingClient";
import type { Tour } from "@/types";

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export default async function CustomBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ tour?: string }>;
}) {
  const params = await searchParams;
  const tourParam = params.tour;
  if (!tourParam) notFound();

  const supabase = await createClient();

  let tour = null;

  if (isUuid(tourParam)) {
    const { data } = await supabase
      .from("tours")
      .select("*")
      .eq("id", tourParam)
      .single();
    tour = data;
  } else {
    const decodedName = decodeURIComponent(tourParam);
    const { data } = await supabase
      .from("tours")
      .select("*")
      .ilike("name", decodedName)
      .limit(1)
      .single();
    tour = data;
  }

  if (!tour) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, logo_url")
    .eq("id", tour.user_id)
    .single();

  return (
    <CustomBookingClient
      tour={tour as Tour}
      companyName={profile?.company_name ?? null}
    />
  );
}
