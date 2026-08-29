"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createZernioClient, ensureWorkspaceZernioProfile } from "@/lib/zernio-client";
import { isSupportedPlatform } from "@/lib/platforms";

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

// ---------------------------------------------------------------------------
// USER MANAGEMENT
// ---------------------------------------------------------------------------

export async function toggleUserStatus(userId: string, newStatus: "active" | "suspended") {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  if (userId === adminUser.id && newStatus === "suspended") {
    return { error: "You cannot suspend your own Super Admin account" };
  }

  const { error } = await serviceClient
    .from("profiles")
    .update({ status: newStatus })
    .eq("id", userId);

  if (error) return { error: error.message };

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

  if (error) return { error: error.message };

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

export async function updateUserProfileAdmin(
  userId: string,
  updates: {
    fullName?: string;
    email?: string;
    platformRole?: "user" | "super_admin";
    status?: "active" | "suspended";
  }
) {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  if (userId === adminUser.id && updates.platformRole === "user") {
    return { error: "You cannot demote your own Super Admin role" };
  }

  // Update Supabase Auth if email is modified
  if (updates.email) {
    const { error: authError } = await serviceClient.auth.admin.updateUserById(userId, {
      email: updates.email,
      email_confirm: true,
      user_metadata: { full_name: updates.fullName },
    });
    if (authError) return { error: `Auth update failed: ${authError.message}` };
  }

  // Update profiles table
  const profileUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (updates.fullName !== undefined) profileUpdates.full_name = updates.fullName;
  if (updates.email !== undefined) profileUpdates.email = updates.email;
  if (updates.platformRole !== undefined) profileUpdates.platform_role = updates.platformRole;
  if (updates.status !== undefined) profileUpdates.status = updates.status;

  const { error } = await serviceClient
    .from("profiles")
    .update(profileUpdates)
    .eq("id", userId);

  if (error) return { error: error.message };

  await serviceClient.from("audit_logs").insert({
    actor_user_id: adminUser.id,
    action: "user.profile_updated",
    target_type: "user",
    target_id: userId,
    metadata: updates as any,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateUserPasswordAdmin(userId: string, newPassword: string) {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  const { error } = await serviceClient.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) return { error: `Failed to update password: ${error.message}` };

  await serviceClient.from("audit_logs").insert({
    actor_user_id: adminUser.id,
    action: "user.password_changed_by_admin",
    target_type: "user",
    target_id: userId,
  });

  return { ok: true };
}

export async function deleteUserAdmin(userId: string) {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  if (userId === adminUser.id) {
    return { error: "You cannot delete your own Super Admin account" };
  }

  // 1. Delete user's workspace memberships
  await serviceClient.from("workspace_members").delete().eq("user_id", userId);

  // 2. Delete public profile
  await serviceClient.from("profiles").delete().eq("id", userId);

  // 3. Delete from Supabase Auth
  const { error: authErr } = await serviceClient.auth.admin.deleteUser(userId);
  if (authErr) {
    console.warn(`Auth user delete warning: ${authErr.message}`);
  }

  await serviceClient.from("audit_logs").insert({
    actor_user_id: adminUser.id,
    action: "user.deleted",
    target_type: "user",
    target_id: userId,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// WORKSPACE MANAGEMENT
// ---------------------------------------------------------------------------

export async function toggleWorkspaceStatus(
  workspaceId: string,
  newStatus: "active" | "suspended"
) {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  const { error } = await serviceClient
    .from("workspaces")
    .update({ status: newStatus })
    .eq("id", workspaceId);

  if (error) return { error: error.message };

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

export async function updateWorkspaceDetailsAdmin(
  workspaceId: string,
  updates: {
    name?: string;
    slug?: string;
    plan?: string;
    status?: "active" | "suspended";
    zernioProfileId?: string;
    limits?: Record<string, unknown>;
  }
) {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.slug !== undefined) updatePayload.slug = updates.slug;
  if (updates.plan !== undefined) updatePayload.plan = updates.plan;
  if (updates.status !== undefined) updatePayload.status = updates.status;
  if (updates.zernioProfileId !== undefined) updatePayload.zernio_profile_id = updates.zernioProfileId;
  if (updates.limits !== undefined) updatePayload.limits = updates.limits;

  const { error } = await serviceClient
    .from("workspaces")
    .update(updatePayload)
    .eq("id", workspaceId);

  if (error) return { error: error.message };

  await serviceClient.from("audit_logs").insert({
    actor_user_id: adminUser.id,
    workspace_id: workspaceId,
    action: "workspace.details_updated",
    target_type: "workspace",
    target_id: workspaceId,
    metadata: updates as any,
  });

  revalidatePath("/admin/workspaces");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteWorkspaceAdmin(workspaceId: string) {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  // Cascade delete all child items for cleanliness
  await Promise.all([
    serviceClient.from("channels").delete().eq("workspace_id", workspaceId),
    serviceClient.from("flows").delete().eq("workspace_id", workspaceId),
    serviceClient.from("contacts").delete().eq("workspace_id", workspaceId),
    serviceClient.from("conversations").delete().eq("workspace_id", workspaceId),
    serviceClient.from("broadcasts").delete().eq("workspace_id", workspaceId),
    serviceClient.from("workspace_members").delete().eq("workspace_id", workspaceId),
  ]);

  const { error } = await serviceClient
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) return { error: error.message };

  await serviceClient.from("audit_logs").insert({
    actor_user_id: adminUser.id,
    action: "workspace.deleted",
    target_type: "workspace",
    target_id: workspaceId,
  });

  revalidatePath("/admin/workspaces");
  revalidatePath("/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// CHANNEL MANAGEMENT & ZERNIO TWO-WAY RECONCILIATION
// ---------------------------------------------------------------------------

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

  if (error) return { error: error.message };

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

export async function deleteChannelAdmin(channelId: string) {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  const { data: channel } = await serviceClient
    .from("channels")
    .select("workspace_id, platform, username")
    .eq("id", channelId)
    .single();

  // Cascade delete relations
  await serviceClient.from("contact_channels").delete().eq("channel_id", channelId);

  const { error } = await serviceClient
    .from("channels")
    .delete()
    .eq("id", channelId);

  if (error) return { error: error.message };

  if (channel) {
    await serviceClient.from("audit_logs").insert({
      actor_user_id: adminUser.id,
      workspace_id: channel.workspace_id,
      action: "channel.deleted",
      target_type: "channel",
      target_id: channelId,
      metadata: { platform: channel.platform, username: channel.username } as any,
    });
  }

  revalidatePath("/admin/channels");
  return { ok: true };
}

/**
 * Reconciles and mirrors all channels across workspaces with active accounts in Zernio.
 */
export async function syncAllPlatformChannelsAdmin() {
  const { adminUser, serviceClient } = await verifySuperAdmin();

  const apiKey = process.env.ZERNIO_API_KEY;
  if (!apiKey) return { error: "ZERNIO_API_KEY is not configured in platform environment." };

  const zernio = createZernioClient(apiKey);

  try {
    // 1. Fetch all accounts from Zernio
    const accountsRes = await zernio.accounts.listAccounts({ query: { limit: 100 } as any });
    const zernioAccounts = accountsRes.data?.accounts || [];
    const zernioAccountIds = new Set(zernioAccounts.map((a: any) => a._id).filter(Boolean));

    // 2. Fetch all local channels in database
    const { data: dbChannels } = await serviceClient.from("channels").select("*");

    let updatedCount = 0;
    let disconnectedCount = 0;

    // 3. Mark removed accounts as disconnected
    for (const ch of dbChannels || []) {
      const accId = ch.zernio_account_id || ch.late_account_id;
      if (!zernioAccountIds.has(accId) && ch.is_active) {
        await serviceClient
          .from("channels")
          .update({
            is_active: false,
            status: "disconnected",
            disconnected_at: new Date().toISOString(),
          })
          .eq("id", ch.id);
        disconnectedCount++;
      }
    }

    // 4. Update existing channels with latest display name / avatar from Zernio
    for (const acc of zernioAccounts) {
      if (!acc._id) continue;
      const matchingCh = dbChannels?.find(
        (c) => c.zernio_account_id === acc._id || c.late_account_id === acc._id
      );

      if (matchingCh) {
        await serviceClient
          .from("channels")
          .update({
            display_name: acc.displayName || acc.username || matchingCh.display_name,
            username: acc.username || matchingCh.username,
            profile_picture: acc.profilePicture || matchingCh.profile_picture,
            is_active: true,
            status: "connected",
            disconnected_at: null,
          })
          .eq("id", matchingCh.id);
        updatedCount++;
      }
    }

    await serviceClient.from("audit_logs").insert({
      actor_user_id: adminUser.id,
      action: "platform.channels_synced",
      target_type: "platform",
      metadata: {
        totalZernioAccounts: zernioAccounts.length,
        updated: updatedCount,
        disconnected: disconnectedCount,
      } as any,
    });

    revalidatePath("/admin/channels");
    revalidatePath("/admin");
    return {
      ok: true,
      totalZernioAccounts: zernioAccounts.length,
      updated: updatedCount,
      disconnected: disconnectedCount,
    };
  } catch (err: any) {
    return { error: `Sync failed: ${err?.message || String(err)}` };
  }
}

// ---------------------------------------------------------------------------
// PLATFORM SETTINGS & SYSTEM HEALTH
// ---------------------------------------------------------------------------

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

  if (error) return { error: error.message };

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

export async function testSystemHealthAdmin() {
  await verifySuperAdmin();

  const results: {
    zernio: { ok: boolean; latencyMs: number; message: string };
    supabase: { ok: boolean; latencyMs: number; message: string };
  } = {
    zernio: { ok: false, latencyMs: 0, message: "" },
    supabase: { ok: false, latencyMs: 0, message: "" },
  };

  // 1. Test Supabase Database
  const startSupa = Date.now();
  try {
    const serviceClient = await createServiceClient();
    const { count, error } = await serviceClient
      .from("workspaces")
      .select("*", { count: "exact", head: true });

    results.supabase.latencyMs = Date.now() - startSupa;
    if (error) {
      results.supabase.ok = false;
      results.supabase.message = error.message;
    } else {
      results.supabase.ok = true;
      results.supabase.message = `Operational (${count ?? 0} workspaces queried)`;
    }
  } catch (err: any) {
    results.supabase.latencyMs = Date.now() - startSupa;
    results.supabase.ok = false;
    results.supabase.message = err?.message || "Supabase connection error";
  }

  // 2. Test Zernio API
  const startZernio = Date.now();
  try {
    const apiKey = process.env.ZERNIO_API_KEY;
    if (!apiKey) {
      results.zernio.ok = false;
      results.zernio.message = "ZERNIO_API_KEY environment variable missing";
    } else {
      const zernio = createZernioClient(apiKey);
      const accounts = await zernio.accounts.listAccounts({ query: { limit: 1 } as any });
      results.zernio.latencyMs = Date.now() - startZernio;
      results.zernio.ok = true;
      results.zernio.message = `Operational (API Authenticated successfully)`;
    }
  } catch (err: any) {
    results.zernio.latencyMs = Date.now() - startZernio;
    results.zernio.ok = false;
    results.zernio.message = err?.message || "Zernio API unreachable";
  }

  return results;
}
