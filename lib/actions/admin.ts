"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verifySuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("platform_role, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.platform_role !== "super_admin" || profile.status === "suspended") {
    throw new Error("Unauthorized: Super Admin access required");
  }

  return { adminUser: user, serviceClient: await createServiceClient() };
}

export async function toggleUserStatus(userId: string, newStatus: "active" | "suspended") {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  if (userId === adminUser.id && newStatus === "suspended") {
    return { error: "You cannot suspend your own Super Admin account" };
  }

  const { error } = await serviceClient
    .from("profiles")
    .update({ status: newStatus })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  // Record audit log
  await serviceClient.from("audit_logs").insert({
    actor_user_id: adminUser.id,
    action: newStatus === "suspended" ? "user.suspended" : "user.reactivated",
    target_type: "user",
    target_id: userId,
    metadata: { status: newStatus } as any,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateUserPlatformRole(userId: string, newRole: "user" | "super_admin") {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  if (userId === adminUser.id && newRole === "user") {
    return { error: "You cannot demote your own Super Admin role" };
  }

  const { error } = await serviceClient
    .from("profiles")
    .update({ platform_role: newRole })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  // Record audit log
  await serviceClient.from("audit_logs").insert({
    actor_user_id: adminUser.id,
    action: "user.role_changed",
    target_type: "user",
    target_id: userId,
    metadata: { new_role: newRole } as any,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function toggleWorkspaceStatus(
  workspaceId: string,
  newStatus: "active" | "suspended"
) {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  const { error } = await serviceClient
    .from("workspaces")
    .update({ status: newStatus })
    .eq("id", workspaceId);

  if (error) {
    return { error: error.message };
  }

  // Record audit log
  await serviceClient.from("audit_logs").insert({
    actor_user_id: adminUser.id,
    workspace_id: workspaceId,
    action: newStatus === "suspended" ? "workspace.suspended" : "workspace.reactivated",
    target_type: "workspace",
    target_id: workspaceId,
    metadata: { status: newStatus } as any,
  });

  revalidatePath("/admin/workspaces");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateWorkspacePlan(
  workspaceId: string,
  plan: string,
  limits?: Record<string, unknown>
) {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  const updatePayload: Record<string, unknown> = { plan };
  if (limits) {
    updatePayload.limits = limits;
  }

  const { error } = await serviceClient
    .from("workspaces")
    .update(updatePayload as any)
    .eq("id", workspaceId);

  if (error) {
    return { error: error.message };
  }

  await serviceClient.from("audit_logs").insert({
    actor_user_id: adminUser.id,
    workspace_id: workspaceId,
    action: "workspace.plan_changed",
    target_type: "workspace",
    target_id: workspaceId,
    metadata: { plan, limits } as any,
  });

  revalidatePath("/admin/workspaces");
  return { ok: true };
}

export async function disconnectChannelAdmin(channelId: string) {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  const { data: channel } = await serviceClient
    .from("channels")
    .select("workspace_id, platform, username")
    .eq("id", channelId)
    .single();

  const { error } = await serviceClient
    .from("channels")
    .update({
      is_active: false,
      status: "disconnected",
      disconnected_at: new Date().toISOString(),
    })
    .eq("id", channelId);

  if (error) {
    return { error: error.message };
  }

  if (channel) {
    await serviceClient.from("audit_logs").insert({
      actor_user_id: adminUser.id,
      workspace_id: channel.workspace_id,
      action: "channel.disconnected",
      target_type: "channel",
      target_id: channelId,
      metadata: { platform: channel.platform, username: channel.username } as any,
    });
  }

  revalidatePath("/admin/channels");
  return { ok: true };
}

export async function updatePlatformSettingsAdmin(
  key: string,
  value: Record<string, unknown>
) {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  const { error } = await serviceClient.from("platform_settings").upsert({
    key,
    value: value as any,
    updated_at: new Date().toISOString(),
    updated_by: adminUser.id,
  });

  if (error) {
    return { error: error.message };
  }

  await serviceClient.from("audit_logs").insert({
    actor_user_id: adminUser.id,
    action: "platform_setting.updated",
    target_type: "platform_setting",
    target_id: key,
    metadata: { value } as any,
  });

  revalidatePath("/admin/settings");
  return { ok: true };
}
