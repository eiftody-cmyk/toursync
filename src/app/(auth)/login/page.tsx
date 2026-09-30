"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        // Calendar scope is handled by the separate custom OAuth flow (/api/auth/google)
        // Supabase only needs identity scopes (email + profile — included by default)
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <Image
          src="/experiencerelay.png"
          alt="ExperienceRelay"
          width={64}
          height={64}
          className="mx-auto rounded-xl mb-2"
          priority
        />
        <CardTitle className="text-2xl">Welcome to ExperienceRelay</CardTitle>
        <CardDescription>Sign in with Google to manage your tours and calendar</CardDescription>
        <p className="text-xs text-muted-foreground mt-1">
          ExperienceRelay syncs availability, bookings and calendars across
          GetYourGuide, Viator, Travelio, Airbnb Experiences, and your direct
          booking page.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>
        )}
        <Button onClick={signInWithGoogle} disabled={loading} className="w-full" size="lg">
          {loading ? "Redirecting..." : "Sign in with Google"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          By signing in you agree to allow ExperienceRelay to manage calendar events (busy blocks) on your
          Google Calendar.
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Questions?{" "}
          <a href="mailto:edward@osakacastletours.com" className="underline">
            edward@osakacastletours.com
          </a>
        </p>
        <div className="text-center text-sm">
          <Link href="/" className="underline text-muted-foreground">
            ← Back to home
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
