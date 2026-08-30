import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/v1/contacts/:contactId
 * Fetches complete contact details, tags, custom fields, and connected channels.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const { contactId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: contact, error } = await supabase
    .from("contacts")
    .select("*, contact_tags(tag_id, tags(*)), contact_channels(*, channels(platform, username, display_name)), contact_custom_fields(*, custom_field_definitions(*))")
    .eq("id", contactId)
    .single();

  if (error || !contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  // Tenant isolation check
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", contact.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return NextResponse.json({ contact });
}

/**
 * PATCH /api/v1/contacts/:contactId
 * Updates contact attributes (display_name, email, is_subscribed, phone, metadata).
 */
export async function PATCH(
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
    .select("workspace_id, metadata")
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
  const updateData: Record<string, any> = {};

  if (body.display_name !== undefined) updateData.display_name = body.display_name;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.is_subscribed !== undefined) updateData.is_subscribed = body.is_subscribed;

  if (body.phone !== undefined || body.metadata !== undefined) {
    const currentMeta = (contact.metadata as Record<string, any>) || {};
    const newMeta = { ...currentMeta, ...(body.metadata || {}) };
    if (body.phone !== undefined) newMeta.phone = body.phone;
    updateData.metadata = newMeta;
  }

  updateData.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("contacts")
    .update(updateData)
    .eq("id", contactId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contact: updated });
}

/**
 * DELETE /api/v1/contacts/:contactId
 * Deletes a contact and cleans up relations.
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

  const { error } = await supabase.from("contacts").delete().eq("id", contactId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
