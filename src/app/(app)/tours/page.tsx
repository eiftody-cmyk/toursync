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
          Manage your tours. Capacity controls auto-block when full (e.g. 6 guests max).
        </p>
      </div>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="text-sm">Suggested tours (from your site)</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">Before Japan Had a Name — 6 guests</Badge>
            <Badge variant="outline">Warrior Monks, a Peasant, and a Shogun — 6 guests</Badge>
            <Badge variant="outline">A Lord, a Concubine, and a Shogun&apos;s Lie — 6 guests</Badge>
            <Badge variant="outline">Goddess, Queen, Empress, Concubine — 6 guests</Badge>
          </div>
          <p>Tip: All 150-min walks are capped at 6. Premium 5h tour also 6. Prices ¥9,500 / ¥28,000.</p>
        </CardContent>
      </Card>

      <ToursClient initialTours={tours ?? []} initialListings={(listings ?? []) as TourChannelListing[]} />
    </div>
  );
}
