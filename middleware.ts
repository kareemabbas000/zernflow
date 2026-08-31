import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { withRateLimit } from "@/lib/rate-limiter";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);

  // 1. CSRF Protection for mutations
  if (isMutation && !isApiRoute) {
    const origin = request.headers.get("origin");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (origin && origin !== appUrl && !origin.startsWith("http://localhost:")) {
      return new NextResponse("Invalid Origin (CSRF)", { status: 403 });
    }
  }

  // 2. Rate Limiting for API routes
  if (isApiRoute && !pathname.startsWith("/api/webhooks/")) {
    const rateLimitResponse = await withRateLimit(
      { endpoint: "global_api", limit: 60, windowSeconds: 60 },
      request.headers.get("x-forwarded-for") || "127.0.0.1"
    );
    if (rateLimitResponse) return rateLimitResponse;
  }

  // 3. Process Session & Basic Auth (already handles /api skips)
  const supabaseResponse = await updateSession(request);
  
  // 4. Suspended User Check for Dashboard/Admin routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    // We create a fresh client just to read the cookies that updateSession might have refreshed
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {}, // Read-only in this phase
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();
        
      if (profile?.status === "suspended" && pathname !== "/suspended") {
        const url = request.nextUrl.clone();
        url.pathname = "/suspended";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
