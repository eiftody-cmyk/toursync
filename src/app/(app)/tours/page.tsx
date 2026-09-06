import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToursClient } from "./ToursClient";
import type { TourChannelListing } from "@/types";

export default async function ToursPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [toursResult, listingsResult] = await Promise.all([
    supabase.from("tours").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("tour_channel_listings").select("*").eq("user_id", user.id).order("created_at"),
  ]);

  const tours = toursResult.data;
  const listings = listingsResult.data;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Tours</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage your tours. Each tour has a capacity limit — when bookings reach that limit,
          ExperienceRelay automatically blocks the date on Airbnb.
        </p>
      </div>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="text-sm">Creating a Tour</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>When you click <strong>+ New Tour</strong>, fill in:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><strong>Name</strong> — Your tour name (e.g. &quot;Warrior Monks, a Peasant, and a Shogun&quot;)</li>
            <li><strong>Description</strong> — Optional details about the tour</li>
            <li><strong>Capacity</strong> — Max guests per tour (used for auto-blocking when full)</li>
            <li><strong>Price</strong> — Tour price (optional)</li>
            <li><strong>Currency</strong> — JPY, USD, EUR, etc.</li>
          </ul>
          <p className="pt-1">
            A Google Calendar is automatically created for each tour.
            Connect it to your Airbnb Experience to sync blocked dates.
          </p>
        </CardContent>
      </Card>

      <ToursClient initialTours={tours ?? []} initialListings={(listings ?? []) as TourChannelListing[]} />
    </div>
  );
}
