import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BookingPageClient } from "./BookingPageClient";
import type { Tour } from "@/types";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ tour?: string; slug?: string }>;
}) {
  const params = await searchParams;
  const tourId = params.tour;
  if (!tourId) notFound();

  const supabase = await createClient();
  const { data: tour } = await supabase
    .from("tours")
    .select("*")
    .eq("id", tourId)
    .single();

  if (!tour) notFound();

  return <BookingPageClient tour={tour as Tour} />;
}
