import { getWorkspace } from "@/lib/workspace";
import { ContactsView } from "./contacts-view";

export default async function ContactsPage() {
  const { workspace, supabase } = await getWorkspace();

  const [contactsRes, tagsRes, channelsRes] = await Promise.all([
    supabase
      .from("contacts")
      .select("*, contact_tags(tag_id, tags(*)), conversations(platform, channel_id, channels(id, display_name, platform, username, profile_picture))")
      .eq("workspace_id", workspace.id)
      .order("last_interaction_at", { ascending: false, nullsFirst: false })
      .limit(100),
    supabase
      .from("tags")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("name"),
    supabase
      .from("channels")
      .select("id, display_name, platform, username, profile_picture, is_active")
      .eq("workspace_id", workspace.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
  ]);

  return (
    <ContactsView
      contacts={(contactsRes.data as any) ?? []}
      tags={tagsRes.data ?? []}
      channels={(channelsRes.data as any) ?? []}
      workspaceId={workspace.id}
    />
  );
}
