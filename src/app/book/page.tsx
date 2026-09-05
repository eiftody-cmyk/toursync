import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BookingPageClient } from "./BookingPageClient";
import type { Tour } from "@/types";

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ tour?: string; slug?: string }>;
}) {
  const params = await searchParams;
  const tourParam = params.tour;
  if (!tourParam) notFound();

  const supabase = await createClient();

  let tour = null;

  if (isUuid(tourParam)) {
    // Lookup by UUID
    const { data } = await supabase
      .from("tours")
      .select("*")
      .eq("id", tourParam)
      .single();
    tour = data;
  } else {
    // Lookup by name (URL-decoded)
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

  return <BookingPageClient tour={tour as Tour} />;
}
