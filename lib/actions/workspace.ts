"use server";

import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { WORKSPACE_COOKIE } from "@/lib/workspace";

export async function switchWorkspace(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Validate user has access to this workspace
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .single();

  if (!membership) return { error: "No access to this workspace" };

  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return { ok: true };
}

export async function createWorkspace(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required" };

  const slug = `${trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;

  const serviceClient = await createServiceClient();

  const { data: workspace, error } = await serviceClient
    .from("workspaces")
    .insert({
      name: trimmed,
      slug,
      owner_id: user.id,
      status: "active",
      subscription_status: "active",
      plan: "free",
    })
    .select("id, name")
    .single();

  if (error || !workspace) {
    return { error: error?.message || "Failed to create workspace" };
  }

  // Add user as owner in workspace_members
  await serviceClient.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
  });

  // Attempt to provision isolated Zernio profile
  try {
    const { ensureWorkspaceZernioProfile } = await import("@/lib/zernio-client");
    await ensureWorkspaceZernioProfile(serviceClient, workspace.id, workspace.name);
  } catch (zernioErr) {
    console.warn("[createWorkspace] Zernio profile auto-provisioning deferred:", zernioErr);
  }

  // Record audit log
  await serviceClient.from("audit_logs").insert({
    actor_user_id: user.id,
    workspace_id: workspace.id,
    action: "workspace.created",
    target_type: "workspace",
    target_id: workspace.id,
    metadata: { name: trimmed, slug } as any,
  });

  // Switch to new workspace
  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE, workspace.id, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return { ok: true, workspaceId: workspace.id };
}
