import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, encryptToken } from "@/lib/google/auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Strict CSRF: state cookie must exist and match
  const expectedState = request.cookies.get("google_oauth_state")?.value;

  if (!expectedState) {
    return NextResponse.redirect(`${origin}/settings?error=missing_oauth_state`);
  }
  if (state !== expectedState) {
    return NextResponse.redirect(`${origin}/settings?error=invalid_oauth_state`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/settings?error=no_code`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=not_authenticated`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const accessTokenEnc = encryptToken(tokens.access_token);
    const refreshTokenEnc = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null;

    // Upsert: keep existing refresh_token if Google doesn't return a new one
    const { data: existing } = await supabase
      .from("google_tokens")
      .select("refresh_token")
      .eq("user_id", user.id)
      .maybeSingle();

    const payload: Record<string, unknown> = {
      user_id: user.id,
      access_token: accessTokenEnc,
      token_expiry: expiry,
      calendar_id: "primary",
      updated_at: new Date().toISOString(),
    };

    if (refreshTokenEnc) {
      payload.refresh_token = refreshTokenEnc;
    } else if (existing?.refresh_token) {
      payload.refresh_token = existing.refresh_token;
    }

    await supabase.from("google_tokens").upsert(payload, { onConflict: "user_id" });

    const res = NextResponse.redirect(`${origin}/settings?google=connected`);
    res.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.redirect(
      `${origin}/settings?error=${encodeURIComponent(msg)}`
    );
  }
}
