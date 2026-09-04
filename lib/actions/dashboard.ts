"use server";

import { getWorkspace } from "@/lib/workspace";
import { formatDistanceToNow } from "date-fns";

export async function getDashboardMetrics() {
  const { workspace, supabase } = await getWorkspace();

  // 1. Active Contacts Count
  const { count: contactsCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  // 2. Messages Handled
  const { count: messagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  // 3. Human Handoff Rate
  const { count: totalConversations } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  const { count: humanConversations } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id)
    .eq("status", "open"); // Using open to represent human handover vs resolved/bot

  const handoffRate =
    totalConversations && humanConversations
      ? ((humanConversations / totalConversations) * 100).toFixed(1)
      : "0.0";

  // 4. Recent Flows
  const { data: recentFlows } = await supabase
    .from("flows")
    .select("id, name, status, updated_at")
    .eq("workspace_id", workspace.id)
    .order("updated_at", { ascending: false })
    .limit(3);

  const formattedFlows = (recentFlows || []).map((flow) => ({
    ...flow,
    formatted_date: flow.updated_at
      ? formatDistanceToNow(new Date(flow.updated_at), { addSuffix: true })
      : "Unknown",
  }));

  // 5. Activity Feed (Audit Logs)
  const { data: activityFeed } = await supabase
    .from("audit_logs")
    .select("id, action, resource_type, resource_id, created_at, user_id, metadata, profiles(email, avatar_url)")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const formattedFeed = ((activityFeed as any[]) || []).map((feed) => {
    // Basic text generator based on action and type
    let title = "Action performed";
    let message = "System logged an event.";
    
    if (feed.action === "created") {
       title = `New ${feed.resource_type}`;
       message = `A ${feed.resource_type} was added to the workspace.`;
    } else if (feed.action === "updated") {
       title = `${feed.resource_type} updated`;
       message = `Changes were saved to a ${feed.resource_type}.`;
    } else if (feed.action === "deleted") {
       title = `${feed.resource_type} deleted`;
       message = `A ${feed.resource_type} was removed.`;
    } else {
       title = feed.action.charAt(0).toUpperCase() + feed.action.slice(1);
       message = `${feed.resource_type} was modified.`;
    }

    return {
      id: feed.id,
      title,
      message,
      time: feed.created_at ? formatDistanceToNow(new Date(feed.created_at), { addSuffix: true }) : "Just now",
      // @ts-ignore
      email: feed.profiles?.email || "System",
    };
  });

  return {
    contactsCount: contactsCount || 0,
    messagesCount: messagesCount || 0,
    handoffRate,
    recentFlows: formattedFlows,
    activityFeed: formattedFeed,
  };
}
