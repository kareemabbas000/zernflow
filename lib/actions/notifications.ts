"use server";

import { getWorkspace } from "@/lib/workspace";

export async function getNotifications() {
  const { workspace, supabase } = await getWorkspace();

  const { data, error } = await (supabase as any)
    .from("notifications")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching notifications", error);
    return [];
  }

  return data;
}

export async function markNotificationAsRead(id: string) {
  const { workspace, supabase } = await getWorkspace();

  const { error } = await (supabase as any)
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("workspace_id", workspace.id);

  if (error) {
    console.error("Error marking notification as read", error);
  }
}

export async function markAllNotificationsAsRead() {
  const { workspace, supabase } = await getWorkspace();

  const { error } = await (supabase as any)
    .from("notifications")
    .update({ is_read: true })
    .eq("workspace_id", workspace.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all notifications as read", error);
  }
}
