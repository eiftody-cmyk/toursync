import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptToken } from "@/lib/google/auth";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch tokens before deleting
  const { data: tokenRow } = await supabase
    .from("google_tokens")
    .select("refresh_token")
    .eq("user_id", user.id)
    .maybeSingle();

  // Best-effort revoke Google grant
  if (tokenRow?.refresh_token) {
    try {
      const refreshToken = decryptToken(tokenRow.refresh_token);
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `token=${refreshToken}`,
      });
    } catch {
      // Revocation failed — still remove local tokens
    }
  }

  // Delete local tokens
  await supabase.from("google_tokens").delete().eq("user_id", user.id);

  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/settings?google=disconnected", url.origin));
}
