/**
 * Super Admin authorization and data layer.
 * 
 * Ensures strict server-side protection for all platform administration capabilities.
 */

import { cache } from "react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Database, PlatformRole } from "@/lib/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type Channel = Database["public"]["Tables"]["channels"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

/**
 * Validates that the current authenticated user has the `super_admin` platform role.
 * Redirects to /dashboard if unauthorized.
 */
export const requireSuperAdmin = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.platform_role !== "super_admin" || profile.status === "suspended") {
    redirect("/dashboard");
  }

  return { user, profile, supabase };
});

/**
 * Fetches platform overview metrics.
 */
export async function getAdminOverviewStats() {
  const serviceClient = await createServiceClient();

  const [
    { count: totalUsers },
    { count: totalWorkspaces },
    { count: activeWorkspaces },
    { count: suspendedWorkspaces },
    { count: totalChannels },
    { count: totalConversations },
    { count: totalMessages },
    { data: channelsByPlatform },
    { data: recentUsers },
    { data: recentWorkspaces },
    { data: recentChannels },
    { data: recentAuditLogs },
  ] = await Promise.all([
    serviceClient.from("profiles").select("*", { count: "exact", head: true }),
    serviceClient.from("workspaces").select("*", { count: "exact", head: true }),
    serviceClient.from("workspaces").select("*", { count: "exact", head: true }).eq("status", "active"),
    serviceClient.from("workspaces").select("*", { count: "exact", head: true }).eq("status", "suspended"),
    serviceClient.from("channels").select("*", { count: "exact", head: true }).eq("is_active", true),
    serviceClient.from("conversations").select("*", { count: "exact", head: true }),
    serviceClient.from("messages").select("*", { count: "exact", head: true }),
    serviceClient.from("channels").select("platform, status"),
    serviceClient
      .from("profiles")
      .select("id, full_name, email, platform_role, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    serviceClient
      .from("workspaces")
      .select("id, name, slug, status, plan, created_at, zernio_profile_id")
      .order("created_at", { ascending: false })
      .limit(6),
    serviceClient
      .from("channels")
      .select("id, platform, username, display_name, status, is_active, created_at, workspace_id, workspaces(name)")
      .order("created_at", { ascending: false })
      .limit(6),
    serviceClient
      .from("audit_logs")
      .select("id, actor_user_id, action, target_type, target_id, metadata, created_at, profiles:actor_user_id(email, full_name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  // Group channels by platform
  const platformCounts: Record<string, number> = {};
  (channelsByPlatform || []).forEach((c) => {
    platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1;
  });

  return {
    totalUsers: totalUsers || 0,
    totalWorkspaces: totalWorkspaces || 0,
    activeWorkspaces: activeWorkspaces || 0,
    suspendedWorkspaces: suspendedWorkspaces || 0,
    totalChannels: totalChannels || 0,
    totalConversations: totalConversations || 0,
    totalMessages: totalMessages || 0,
    platformCounts,
    recentUsers: recentUsers || [],
    recentWorkspaces: recentWorkspaces || [],
    recentChannels: recentChannels || [],
    recentAuditLogs: recentAuditLogs || [],
  };
}
