import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export interface RateLimitConfig {
  endpoint: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Validates a rate limit using a token bucket backed by Supabase RPC.
 */
export async function checkRateLimit(
  config: RateLimitConfig,
  identifier: string
): Promise<RateLimitResult> {
  const supabase = await createClient();
  const key = `${identifier}:${config.endpoint}`;
  
  // Calculate refill rate (tokens per second)
  const refillRate = config.limit / config.windowSeconds;
  
  const { data, error } = await supabase.rpc("consume_rate_limit_token", {
    limit_key: key,
    max_tokens: config.limit,
    refill_rate: refillRate,
  });

  if (error) {
    console.error("[RateLimiter] Error consuming token:", error);
    // Fail open if the database is down or having issues to avoid blocking valid traffic entirely
    return {
      success: true,
      limit: config.limit,
      remaining: 1, 
      reset: Math.floor(Date.now() / 1000) + config.windowSeconds,
    };
  }

  // Unfortunately the simple boolean RPC doesn't return exactly how many are remaining,
  // but it returns whether the token was successfully consumed.
  // We can simulate the remaining headers roughly or just use 0 when failed.
  return {
    success: data as boolean,
    limit: config.limit,
    remaining: data ? 1 : 0, 
    reset: Math.floor(Date.now() / 1000) + config.windowSeconds,
  };
}

/**
 * Returns a NextResponse with appropriate 429 status and headers if rate limited.
 * Useful for Next.js API routes or Middleware.
 */
export async function withRateLimit(
  config: RateLimitConfig,
  identifier?: string
): Promise<NextResponse | null> {
  let id = identifier;
  
  if (!id) {
    const headersList = await headers();
    // Use IP address as a fallback identifier
    const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
    id = ip.split(",")[0].trim();
  }
  
  const result = await checkRateLimit(config, id);
  
  if (!result.success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": config.windowSeconds.toString(),
      },
    });
  }
  
  // Returning null means the request can proceed
  return null;
}
