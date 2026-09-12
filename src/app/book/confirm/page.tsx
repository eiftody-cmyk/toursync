import { redirect } from "next/navigation";
import { ConfirmPageClient } from "./ConfirmPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Confirmation — Osaka Castle Walks with Edward",
  icons: {
    icon: "/favicon-castle.png",
    apple: "/apple-touch-icon-castle.png",
  },
};

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;
  if (!token) redirect("/book");

  return <ConfirmPageClient orderId={token} />;
}
