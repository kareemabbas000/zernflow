import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yeqaqngjsqtfszwttgbm.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllcWFxbmdqc3F0ZnN6d3R0Z2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTgwNzQsImV4cCI6MjEwMzMzNDA3NH0.0eLnU4l7bSSCZb0VkBAf9aJK7rTpjiBEv8CAMFpwRxU";

  return createBrowserClient<Database>(url, anonKey);
}
