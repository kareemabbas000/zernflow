import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/types/database";

type WorkspaceRow = Database["public"]["Tables"]["workspaces"]["Row"];

export const WORKSPACE_COOKIE = "zernflow_workspace_id";

/**
 * Cached per-request: deduplicates across layout + page in the same render.
 * Reads workspace ID from cookie if set; falls back to first workspace.
 */
export const getWorkspace = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const selectedId = cookieStore.get(WORKSPACE_COOKIE)?.value;

  // Try cookie workspace first
  if (selectedId) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(*)")
      .eq("user_id", user.id)
      .eq("workspace_id", selectedId)
      .maybeSingle();

    if (membership?.workspaces) {
      const ws = (
        Array.isArray(membership.workspaces)
          ? membership.workspaces[0]
          : membership.workspaces
      ) as unknown as WorkspaceRow;

      if (ws?.id) {
        return {
          user,
          workspace: ws,
          role: membership.role,
          supabase,
        };
      }
    }
  }

  // Fallback to first workspace
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.workspaces) {
    redirect("/onboarding");
  }

  const ws = (
    Array.isArray(membership.workspaces)
      ? membership.workspaces[0]
      : membership.workspaces
  ) as unknown as WorkspaceRow;

  if (!ws?.id) {
    redirect("/onboarding");
  }

  return {
    user,
    workspace: ws,
    role: membership.role,
    supabase,
  };
});
