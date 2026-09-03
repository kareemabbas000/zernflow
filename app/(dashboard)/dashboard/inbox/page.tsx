import { getWorkspace } from "@/lib/workspace";
import { InboxView } from "./inbox-view";

export default async function InboxPage() {
  const { workspace, supabase } = await getWorkspace();

  const [{ data: conversations }, { data: channels }] = await Promise.all([
    supabase
      .from("conversations")
      .select("*, contacts(*), channels(id, display_name, platform, username, profile_picture, is_active)")
      .eq("workspace_id", workspace.id)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(50),
    supabase
      .from("channels")
      .select("id, display_name, platform, username, profile_picture, is_active")
      .eq("workspace_id", workspace.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
  ]);

  return (
    <InboxView
      conversations={(conversations as any) ?? []}
      channels={(channels as any) ?? []}
      workspaceId={workspace.id}
    />
  );
}
