import { redirect } from "next/navigation";
import { ConfirmPageClient } from "./ConfirmPageClient";

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
