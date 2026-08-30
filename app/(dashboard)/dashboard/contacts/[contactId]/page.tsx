import { notFound } from "next/navigation";
import { getWorkspace } from "@/lib/workspace";
import { ContactProfileView } from "./contact-profile-view";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const { workspace, supabase } = await getWorkspace();

  const [contactRes, channelsRes, conversationsRes, customFieldsRes, tagsRes, notesRes] =
    await Promise.all([
      supabase
        .from("contacts")
        .select("*, contact_tags(tag_id, tags(*))")
        .eq("id", contactId)
        .eq("workspace_id", workspace.id)
        .single(),
      supabase
        .from("contact_channels")
        .select("*, channels(platform, username, display_name)")
        .eq("contact_id", contactId),
      supabase
        .from("conversations")
        .select("*")
        .eq("contact_id", contactId)
        .eq("workspace_id", workspace.id)
        .order("last_message_at", { ascending: false }),
      supabase
        .from("contact_custom_fields")
        .select("value, custom_field_definitions(name, slug, field_type)")
        .eq("contact_id", contactId),
      supabase
        .from("contact_tags")
        .select("tag_id, tags(*)")
        .eq("contact_id", contactId),
      supabase
        .from("contact_notes")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false }),
    ]);

  if (!contactRes.data) notFound();

  const contact = contactRes.data;
  const channels = channelsRes.data ?? [];
  const conversations = conversationsRes.data ?? [];
  const customFields = customFieldsRes.data ?? [];
  const tags = (tagsRes.data ?? []).map((t) => t.tags).filter(Boolean);
  const notes = notesRes.data ?? [];

  return (
    <ContactProfileView
      contact={contact}
      channels={channels as any}
      conversations={conversations as any}
      customFields={customFields as any}
      tags={tags as any}
      notes={notes as any}
      workspaceId={workspace.id}
    />
  );
}
