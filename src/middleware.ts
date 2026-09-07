import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const GYG_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // CORS preflight for GYG Supplier API endpoints
  if (pathname.startsWith("/1/") && request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: GYG_CORS_HEADERS });
  }

  // Skip Supabase session for GYG Supplier API routes — they use Basic Auth, not cookies
  if (pathname.startsWith("/1/")) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth");

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/health");

  // Allow public + auth routes without redirect
  if (isPublicRoute || isAuthRoute) {
    return supabaseResponse;
  }

  // Protect /dashboard, /calendar, /tours, /settings
  const protectedPrefixes = ["/dashboard", "/calendar", "/tours", "/settings"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
