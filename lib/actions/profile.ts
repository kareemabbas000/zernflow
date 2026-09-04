"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProfile(data: { full_name?: string; email?: string; avatar_url?: string; password?: string }) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData?.user) {
    return { error: "Not authenticated" };
  }

  const updates: any = {};
  if (data.full_name) updates.data = { ...updates.data, full_name: data.full_name };
  if (data.avatar_url) updates.data = { ...updates.data, avatar_url: data.avatar_url };
  if (data.email) updates.email = data.email;
  if (data.password) updates.password = data.password;

  const { error } = await supabase.auth.updateUser(updates);

  if (error) {
    console.error("Error updating profile", error);
    return { error: error.message };
  }

  // If email was changed, supabase handles sending a confirmation email if configured.
  return { success: true };
}
