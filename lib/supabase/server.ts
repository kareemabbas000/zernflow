import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types/database";

const DEFAULT_SUPABASE_URL = "https://yeqaqngjsqtfszwttgbm.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllcWFxbmdqc3F0ZnN6d3R0Z2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTgwNzQsImV4cCI6MjEwMzMzNDA3NH0.0eLnU4l7bSSCZb0VkBAf9aJK7rTpjiBEv8CAMFpwRxU";
const DEFAULT_SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllcWFxbmdqc3F0ZnN6d3R0Z2JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzc1ODA3NCwiZXhwIjoyMTAzMzM0MDc0fQ.5pJ1HDgUvzw91Ez7K_ALvKbt8M_tZOYTDJk1KJYECL0";

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component. Can be ignored if middleware refreshes sessions.
        }
      },
    },
  });
}

export async function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  return createServerClient<Database>(url, serviceKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
