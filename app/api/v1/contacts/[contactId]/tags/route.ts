import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/v1/contacts/:contactId/tags
 * Adds a tag to a contact. Automatically creates the tag definition if it does not exist.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const { contactId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: contact } = await supabase
    .from("contacts")
    .select("workspace_id")
    .eq("id", contactId)
    .single();

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", contact.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const body = await request.json();
  const tagName = (body.name || body.tagName || "").trim();
  const color = body.color || "#6366f1";

  if (!tagName) {
    return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
  }

  // 1. Find or create tag
  let tagId: string;
  const { data: existingTag } = await supabase
    .from("tags")
    .select("id")
    .eq("workspace_id", contact.workspace_id)
    .ilike("name", tagName)
    .maybeSingle();

  if (existingTag) {
    tagId = existingTag.id;
  } else {
    const { data: newTag, error: createTagErr } = await supabase
      .from("tags")
      .insert({
        workspace_id: contact.workspace_id,
        name: tagName,
        color,
      })
      .select("id")
      .single();

    if (createTagErr || !newTag) {
      return NextResponse.json(
        { error: createTagErr?.message || "Failed to create tag" },
        { status: 500 }
      );
    }
    tagId = newTag.id;
  }

  // 2. Link contact to tag
  const { error: linkErr } = await supabase
    .from("contact_tags")
    .upsert({ contact_id: contactId, tag_id: tagId }, { onConflict: "contact_id,tag_id" });

  if (linkErr) {
    return NextResponse.json({ error: linkErr.message }, { status: 500 });
  }

  // Log analytics event
  await supabase.from("analytics_events").insert({
    workspace_id: contact.workspace_id,
    contact_id: contactId,
    event_type: "tag_applied",
    metadata: { tagName, tagId },
  });

  // Return updated tags
  const { data: updatedTags } = await supabase
    .from("contact_tags")
    .select("tag_id, tags(*)")
    .eq("contact_id", contactId);

  const tags = (updatedTags || []).map((t) => t.tags).filter(Boolean);
  return NextResponse.json({ tags });
}

/**
 * DELETE /api/v1/contacts/:contactId/tags
 * Removes a tag from a contact.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const { contactId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: contact } = await supabase
    .from("contacts")
    .select("workspace_id")
    .eq("id", contactId)
    .single();

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", contact.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const body = await request.json();
  const tagId = body.tagId;

  if (!tagId) {
    return NextResponse.json({ error: "tagId is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("contact_tags")
    .delete()
    .eq("contact_id", contactId)
    .eq("tag_id", tagId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return remaining tags
  const { data: remaining } = await supabase
    .from("contact_tags")
    .select("tag_id, tags(*)")
    .eq("contact_id", contactId);

  const tags = (remaining || []).map((t) => t.tags).filter(Boolean);
  return NextResponse.json({ tags });
}
