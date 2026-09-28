import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPartner, REFERRAL_PARTNERS } from "@/config/referral-partners";
import { JoinClient } from "./JoinClient";

// Staff self-registration for referral QR codes. Noindex: these URLs are
// shared directly with staff, never meant for search engines.
export const metadata: Metadata = {
  title: "Get your referral QR — Osaka Castle Tours",
  robots: { index: false, follow: false },
};

export default async function RefJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string }>;
}) {
  const params = await searchParams;
  const raw = typeof params.partner === "string" ? params.partner.trim() : "";
  // ?partner= must be an approved partner (404 otherwise — a client can never
  // reach the form with an unknown one); omitted → the company chooser.
  const partner = raw ? getPartner(raw) : null;
  if (raw && !partner) notFound();

  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY ?? "";

  return (
    <main className="min-h-screen bg-background text-foreground flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <JoinClient
          partners={REFERRAL_PARTNERS}
          initialPartner={partner}
          turnstileSiteKey={turnstileSiteKey}
        />
      </div>
    </main>
  );
}
