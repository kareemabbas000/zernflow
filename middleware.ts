import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { withRateLimit } from "@/lib/rate-limiter";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

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

  // Next-intl middleware for non-API routes
  let response = NextResponse.next();
  if (!isApiRoute) {
    response = intlMiddleware(request);
  }

  // 3. Process Session & Basic Auth
  // We'll run the updated session logic (needs to be adapted to handle the response)
  const supabaseResponse = await updateSession(request, response);
  
  // 4. Suspended User Check for Dashboard/Admin routes
  // Strip locale for checks
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '');
  if (pathWithoutLocale.startsWith("/dashboard") || pathWithoutLocale.startsWith("/admin")) {
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
        
      if (profile?.status === "suspended" && pathWithoutLocale !== "/suspended") {
        const url = request.nextUrl.clone();
        url.pathname = "/suspended"; // next-intl will handle this if needed, or we redirect explicitly
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
