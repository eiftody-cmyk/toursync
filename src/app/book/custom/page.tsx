import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CustomBookingClient } from "./CustomBookingClient";
import { TourPicker } from "../TourPicker";
import type { Tour } from "@/types";
import type { Metadata } from "next";

const SITE = "https://osakacastletours.com";
const OG_IMAGE = `${SITE}/images/toyotomicastle.webp`;

export const metadata: Metadata = {
  title: "Custom Tour Booking — Osaka Castle Walks with Edward",
  description:
    "Design a custom private walking tour of Osaka Castle with Edward Iftody — your route, your focus, your dates, for groups of up to six.",
  openGraph: {
    title: "Custom Tour Booking — Osaka Castle Walks with Edward",
    description:
      "Design a custom private walking tour of Osaka Castle — your route, your focus, your dates.",
    url: `${SITE}/book/custom`,
    siteName: "Osaka Castle Walks with Edward",
    type: "website",
    images: [{ url: OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Tour Booking — Osaka Castle Walks with Edward",
    description: "Design a custom private walking tour of Osaka Castle.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: `${SITE}/book/custom`,
  },
};

const customJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Book a Tour", item: `${SITE}/book` },
    { "@type": "ListItem", position: 3, name: "Custom Tour", item: `${SITE}/book/custom` },
  ],
};

function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(customJsonLd) }}
    />
  );
}

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function isHiddenTour(tourId: string): boolean {
  const hidden = process.env.HIDDEN_TOUR_IDS ?? "";
  return hidden.split(",").map((s) => s.trim()).filter(Boolean).includes(tourId);
}

export default async function CustomBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ tour?: string }>;
}) {
  const params = await searchParams;
  const tourParam = params.tour;
  if (!tourParam)
    return (
      <>
        <StructuredData />
        <TourPicker mode="custom" />
      </>
    );

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
  if (isHiddenTour(tour.id)) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, logo_url")
    .eq("id", tour.user_id)
    .single();

  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  if (!paypalClientId) throw new Error("PAYPAL_CLIENT_ID not configured");

  return (
    <>
      <StructuredData />
      <CustomBookingClient
        tour={tour as Tour}
        companyName={profile?.company_name ?? null}
        paypalClientId={paypalClientId}
      />
    </>
  );
}
