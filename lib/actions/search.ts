"use server";

import { getWorkspace } from "@/lib/workspace";

export async function searchGlobal(query: string) {
  if (!query || query.length < 2) return { contacts: [], flows: [] };
  const { workspace, supabase } = await getWorkspace();

  const [{ data: contacts }, { data: flows }] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, name, email")
      .eq("workspace_id", workspace.id)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(5),
    supabase
      .from("flows")
      .select("id, name, status")
      .eq("workspace_id", workspace.id)
      .ilike("name", `%${query}%`)
      .limit(5)
  ]);

  return {
    contacts: contacts || [],
    flows: flows || []
  };
}
