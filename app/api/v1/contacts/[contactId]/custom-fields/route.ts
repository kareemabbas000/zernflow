import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/v1/contacts/:contactId/custom-fields
 * Sets a custom field definition and value on a contact.
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
  const slug = (body.slug || body.name || "").toLowerCase().trim().replace(/[^a-z0-9_]/g, "_");
  const name = body.name || slug;
  const value = String(body.value ?? "");

  if (!slug) {
    return NextResponse.json({ error: "Field slug or name is required" }, { status: 400 });
  }

  // 1. Find or create field definition
  let fieldDefId: string;
  const { data: existingDef } = await supabase
    .from("custom_field_definitions")
    .select("id")
    .eq("workspace_id", contact.workspace_id)
    .eq("slug", slug)
    .maybeSingle();

  if (existingDef) {
    fieldDefId = existingDef.id;
  } else {
    const { data: newDef, error: createDefErr } = await supabase
      .from("custom_field_definitions")
      .insert({
        workspace_id: contact.workspace_id,
        name,
        slug,
        type: "text",
      })
      .select("id")
      .single();

    if (createDefErr || !newDef) {
      return NextResponse.json(
        { error: createDefErr?.message || "Failed to create field definition" },
        { status: 500 }
      );
    }
    fieldDefId = newDef.id;
  }

  // 2. Set value
  const { error: setValErr } = await supabase
    .from("contact_custom_fields")
    .upsert(
      { contact_id: contactId, field_id: fieldDefId, value, updated_at: new Date().toISOString() },
      { onConflict: "contact_id,field_id" }
    );

  if (setValErr) {
    return NextResponse.json({ error: setValErr.message }, { status: 500 });
  }

  // Return updated fields
  const { data: fields } = await supabase
    .from("contact_custom_fields")
    .select("*, custom_field_definitions(*)")
    .eq("contact_id", contactId);

  return NextResponse.json({ customFields: fields || [] });
}
