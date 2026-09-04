import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TourCalendarsCard } from "@/components/settings/TourCalendarsCard";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileResult, tokenResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("google_tokens").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const profile = profileResult.data;
  const token = tokenResult.data;

  const success = params.google === "connected";
  const error = params.error;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {success && (
        <Card className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="pt-6 text-sm text-emerald-800 dark:text-emerald-200">
            Google account connected. Now create per-tour calendars below.
          </CardContent>
        </Card>
      )}
      {error && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6 text-sm text-red-700 dark:text-red-200">
            Error: {decodeURIComponent(error)}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Email:</strong> {profile?.email ?? user.email}
          </p>
          <p>
            <strong>Name:</strong> {profile?.full_name ?? "—"}
          </p>
          <p>
            <strong>User ID:</strong> <code className="text-xs break-all">{user.id}</code>
          </p>
          <form action="/auth/signout" method="post" className="pt-2">
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 1: Google Calendar Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {token ? (
            <>
              <p className="flex items-center gap-2">
                Status: <Badge className="bg-emerald-500">Connected</Badge>
              </p>
              {token.token_expiry && (
                <p className="text-muted-foreground">Token expires: {new Date(token.token_expiry).toLocaleString()}</p>
              )}
              <p className="text-muted-foreground">
                This connects TourSync to your Google account so it can create calendars and manage events.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href="/api/auth/google">Reconnect</a>
                </Button>
                <form action="/api/auth/google/disconnect" method="post">
                  <Button size="sm" variant="destructive" type="submit">
                    Disconnect
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                Connect your Google account to give TourSync access to create and manage calendars.
              </p>
              <Button asChild size="sm">
                <a href="/api/auth/google">Connect Google Calendar</a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {token && <TourCalendarsCard />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How Airbnb sync works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ol className="list-decimal pl-5 space-y-1">
            <li>You block a date in TourSync → TourSync creates a &quot;busy&quot; event on Google Calendar.</li>
            <li>Google pushes the busy event to Airbnb — usually immediate, allow a minute for propagation.</li>
            <li>You unblock → TourSync deletes the Google event → Google pushes the removal to Airbnb.</li>
            <li>
              Auto-block: when bookings fill a tour (e.g. 4+2 = 6), TourSync auto-creates a block so Airbnb shows
              unavailable.
            </li>
            <li>
              Per-tour calendars: create a calendar per tour so each Airbnb Experience syncs independently.
              Block one tour without affecting others.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
