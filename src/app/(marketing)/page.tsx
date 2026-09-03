import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center">
        <Badge className="mb-4" variant="secondary">
          Phase 1 MVP — Dashboard + Airbnb Calendar Sync
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
          Block dates on Airbnb once. <br />
          <span className="text-muted-foreground">Sync everywhere.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          For small tour operators who sell on multiple platforms. Track
          bookings, see remaining capacity at a glance, and never oversell.
          When a tour fills up, it auto-blocks on Airbnb via Google Calendar.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/login">Get Started Free</Link>
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          No credit card required. Connect Google Calendar in 2 clicks.
        </p>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 border-y">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-semibold text-center">How it works</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <CardTitle className="text-base">Connect Google Calendar</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                One OAuth click. TourSync creates &quot;busy&quot; events on your
                Google Calendar. Google pushes them to Airbnb — usually immediate,
                allow a minute for propagation.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <CardTitle className="text-base">Track bookings + block dates</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Add bookings with quick entry (tour, date, guests, source).
                Block a date for &quot;Morning lesson&quot; or any reason. Calendar
                shows capacity: green / amber / red.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <CardTitle className="text-base">Auto-block when full</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Capacity 6 and you have 4+2 guests? TourSync auto-creates a busy
                block. Airbnb shows unavailable. No mental math, no overselling.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-semibold">What&apos;s in Phase 1</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6 text-sm">
          <ul className="space-y-2">
            <li>✅ Google login via Supabase Auth</li>
            <li>✅ Tours CRUD (capacity, price, currency)</li>
            <li>✅ Calendar month/week/day with click-to-block</li>
            <li>✅ Booking quick entry (guests, source, customer name)</li>
          </ul>
          <ul className="space-y-2">
            <li>✅ Capacity bars + auto-block when full</li>
            <li>✅ Google Calendar create/delete + token refresh</li>
            <li>✅ Dashboard overview + Settings / disconnect</li>
            <li>⏳ Viator/GYG API sync — Phase 3–5</li>
          </ul>
        </div>
        <Card className="mt-8 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20">
          <CardContent className="pt-6 text-sm">
            <strong>Note:</strong> Google pushes busy events to Airbnb immediately.
            Sync is near-instant — no polling delay.
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold">Ready to stop juggling calendars?</h2>
        <p className="mt-2 text-muted-foreground">
          Built for Edward — 4 Osaka Castle tours, 6 guests max, 3 booking platforms.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/login">Sign in with Google</Link>
        </Button>
      </section>
    </div>
  );
}
