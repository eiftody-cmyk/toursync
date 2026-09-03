"use client";

import { useState } from "react";
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
        <CardTitle className="text-2xl">Welcome to TourSync</CardTitle>
        <CardDescription>Sign in with Google to manage your tours and calendar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>
        )}
        <Button onClick={signInWithGoogle} disabled={loading} className="w-full" size="lg">
          {loading ? "Redirecting..." : "Sign in with Google"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          By signing in you agree to allow TourSync to manage calendar events (busy blocks) on your
          Google Calendar.
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
