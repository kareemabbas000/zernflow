"use server";

import { getWorkspace } from "@/lib/workspace";

export async function getWorkspaceSubscription() {
  const { workspace, supabase } = await getWorkspace();

  const { data, error } = await (supabase as any)
    .from("workspace_subscriptions")
    .select("*")
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }

  return data;
}

export async function getBillingMetrics() {
  const { workspace, supabase } = await getWorkspace();

  // For multi-tenant billing, we often show usage limits
  const { count: contactsCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  const { count: flowsCount } = await supabase
    .from("flows")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  return {
    contactsCount: contactsCount || 0,
    flowsCount: flowsCount || 0,
  };
}
