import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("tour_channel_listings")
    .select("tour_id, tours(name, id)")
    .eq("channel", "gyg")
    .limit(5);

  return NextResponse.json({
    keySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    count: data?.length,
    data: data?.slice(0, 2),
    error: error?.message,
  });
}
