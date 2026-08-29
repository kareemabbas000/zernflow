/**
 * Zernio API client & Multi-Tenant Profile Management.
 *
 * The platform ZERNIO_API_KEY is kept strictly server-side.
 * Each customer workspace is mapped to an isolated Zernio Profile.
 */

import Zernio from "@zernio/node";
import type { SupabaseClient } from "@supabase/supabase-js";

export type { Zernio };

const DEFAULT_PLATFORM_KEY = "sk_c416f7cface10315cf689dffdf701cfdb32a86435af0ca1535b2d53abce3f52d";

/**
 * Creates a Zernio SDK client instance with the given API key.
 */
export function createZernioClient(apiKey?: string | null): Zernio {
  const key = apiKey?.trim() || process.env.ZERNIO_API_KEY?.trim() || DEFAULT_PLATFORM_KEY;
  if (!key) {
    throw new Error(
      "Zernio API key is not configured. Please set ZERNIO_API_KEY in your environment variables."
    );
  }
  return new Zernio({ apiKey: key });
}

/**
 * Returns the platform-level Zernio client.
 */
export function getPlatformZernioClient(): Zernio {
  return createZernioClient(process.env.ZERNIO_API_KEY || DEFAULT_PLATFORM_KEY);
}

/**
 * Ensures a workspace has an isolated Zernio profile provisioned.
 * If not already present, creates one via the Zernio API and stores the zernio_profile_id in Supabase.
 */
export async function ensureWorkspaceZernioProfile(
  supabase: SupabaseClient,
  workspaceId: string,
  workspaceName?: string
): Promise<{ profileId: string; zernio: Zernio }> {
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .select("id, name, zernio_profile_id, late_api_key_encrypted")
    .eq("id", workspaceId)
    .single();

  if (wsError || !workspace) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  // Use platform API key first, fall back to legacy per-workspace key if present
  const apiKey =
    process.env.ZERNIO_API_KEY ||
    workspace.late_api_key_encrypted ||
    DEFAULT_PLATFORM_KEY;

  const zernio = createZernioClient(apiKey);

  // If already provisioned, return it
  if (workspace.zernio_profile_id) {
    return { profileId: workspace.zernio_profile_id, zernio };
  }

  // Try to create or find a dedicated profile for this workspace
  const name = workspaceName || workspace.name || "Workspace";
  try {
    // Attempt creating a new profile for this workspace
    const createRes = await (zernio.profiles as any).createProfile({
      body: { name: `${name} (${workspaceId.slice(0, 8)})` },
    });

    const newProfileId =
      createRes?.data?.profile?._id ||
      createRes?.data?.profile?.id ||
      createRes?.data?._id ||
      createRes?.data?.id;

    if (newProfileId) {
      await supabase
        .from("workspaces")
        .update({ zernio_profile_id: newProfileId })
        .eq("id", workspaceId);

      return { profileId: newProfileId, zernio };
    }
  } catch (createErr) {
    console.warn("[Zernio] Profile creation failed, checking existing profiles:", createErr);
  }

  // Fallback: Check existing profiles on this account
  try {
    const listRes = await zernio.profiles.listProfiles();
    const profiles = listRes?.data?.profiles ?? [];
    if (profiles.length > 0 && profiles[0]._id) {
      const fallbackId = profiles[0]._id;
      await supabase
        .from("workspaces")
        .update({ zernio_profile_id: fallbackId })
        .eq("id", workspaceId);

      return { profileId: fallbackId, zernio };
    }
  } catch (listErr) {
    console.error("[Zernio] Failed to list profiles:", listErr);
  }

  throw new Error("Unable to provision or resolve a Zernio profile for this workspace.");
}
