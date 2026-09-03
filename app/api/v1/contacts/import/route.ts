import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

interface ImportContactPayload {
  name: string;
  email?: string;
  phone?: string;
  leadStage?: string;
  isSubscribed?: boolean;
  tags?: string[];
  customFields?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, contacts, defaultStage, updateExisting } = body as {
      workspaceId: string;
      contacts: ImportContactPayload[];
      defaultStage?: string;
      updateExisting?: boolean;
    };

    if (!workspaceId || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload: workspaceId and contacts list required" },
        { status: 400 }
      );
    }

    // Verify user belongs to workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Access denied to workspace" }, { status: 403 });
    }

    const serviceClient = await createServiceClient();

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Pre-fetch tags for this workspace to map names to IDs
    const { data: existingTags } = await serviceClient
      .from("tags")
      .select("id, name")
      .eq("workspace_id", workspaceId);

    const tagMap = new Map<string, string>();
    existingTags?.forEach((t) => tagMap.set(t.name.toLowerCase().trim(), t.id));

    // Pre-fetch custom field definitions
    const { data: existingFieldDefs } = await serviceClient
      .from("custom_field_definitions")
      .select("id, slug")
      .eq("workspace_id", workspaceId);

    const fieldDefMap = new Map<string, string>();
    existingFieldDefs?.forEach((f) => fieldDefMap.set(f.slug.toLowerCase().trim(), f.id));

    // Process each contact in a resilient transaction-safe manner
    for (const c of contacts) {
      const displayName = c.name?.trim();
      const email = c.email?.trim() || null;
      const phone = c.phone?.trim() || null;
      const stage = c.leadStage?.trim().toLowerCase() || defaultStage || "lead";
      const isSubscribed = c.isSubscribed !== undefined ? Boolean(c.isSubscribed) : true;

      if (!displayName && !email && !phone) {
        skippedCount++;
        continue;
      }

      try {
        let existingContactId: string | null = null;

        // Check if contact already exists by email, or phone in metadata
        if (email) {
          const { data: found } = await serviceClient
            .from("contacts")
            .select("id, metadata")
            .eq("workspace_id", workspaceId)
            .eq("email", email)
            .maybeSingle();
          if (found) existingContactId = found.id;
        }

        if (!existingContactId && phone) {
          const { data: foundByPhone } = await serviceClient
            .from("contacts")
            .select("id, metadata")
            .eq("workspace_id", workspaceId)
            .contains("metadata", { phone })
            .maybeSingle();
          if (foundByPhone) existingContactId = foundByPhone.id;
        }

        let contactId = existingContactId;

        if (contactId && updateExisting) {
          // Update existing contact
          const metadataUpdate: Record<string, any> = {};
          if (phone) metadataUpdate.phone = phone;

          await serviceClient
            .from("contacts")
            .update({
              display_name: displayName || undefined,
              email: email || undefined,
              lead_stage: stage,
              is_subscribed: isSubscribed,
              metadata: metadataUpdate,
              updated_at: new Date().toISOString(),
            })
            .eq("id", contactId);

          updatedCount++;
        } else if (!contactId) {
          // Create new contact
          const metadataInsert: Record<string, any> = {};
          if (phone) metadataInsert.phone = phone;

          const { data: newContact, error: insertErr } = await serviceClient
            .from("contacts")
            .insert({
              workspace_id: workspaceId,
              display_name: displayName || email || phone || "Unnamed Contact",
              email,
              lead_stage: stage,
              is_subscribed: isSubscribed,
              metadata: metadataInsert,
            })
            .select("id")
            .single();

          if (insertErr || !newContact) {
            errors.push(`Failed to insert ${displayName || email}: ${insertErr?.message}`);
            continue;
          }

          contactId = newContact.id;
          importedCount++;
        } else {
          skippedCount++;
        }

        if (!contactId) continue;

        // Process tags
        if (Array.isArray(c.tags) && c.tags.length > 0) {
          for (const rawTag of c.tags) {
            const tagName = rawTag.trim();
            if (!tagName) continue;
            const tagKey = tagName.toLowerCase();

            let tagId = tagMap.get(tagKey);
            if (!tagId) {
              // Create tag
              const { data: createdTag } = await serviceClient
                .from("tags")
                .insert({
                  workspace_id: workspaceId,
                  name: tagName,
                  color: "#6366f1",
                })
                .select("id")
                .single();

              if (createdTag) {
                tagId = createdTag.id;
                tagMap.set(tagKey, tagId);
              }
            }

            if (tagId) {
              await serviceClient
                .from("contact_tags")
                .upsert(
                  { contact_id: contactId, tag_id: tagId },
                  { onConflict: "contact_id,tag_id" }
                );
            }
          }
        }

        // Process custom fields
        if (c.customFields && typeof c.customFields === "object") {
          for (const [key, val] of Object.entries(c.customFields)) {
            const fieldVal = String(val ?? "").trim();
            if (!fieldVal) continue;
            const fieldSlug = key.toLowerCase().trim().replace(/[^a-z0-9_]/g, "_");

            let defId = fieldDefMap.get(fieldSlug);
            if (!defId) {
              const { data: createdDef } = await serviceClient
                .from("custom_field_definitions")
                .insert({
                  workspace_id: workspaceId,
                  name: key.trim(),
                  slug: fieldSlug,
                  type: "text",
                })
                .select("id")
                .single();

              if (createdDef) {
                defId = createdDef.id;
                fieldDefMap.set(fieldSlug, defId);
              }
            }

            if (defId) {
              await serviceClient
                .from("contact_custom_fields")
                .upsert(
                  {
                    contact_id: contactId,
                    field_id: defId,
                    value: fieldVal,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "contact_id,field_id" }
                );
            }
          }
        }
      } catch (err) {
        errors.push(`Error on ${displayName || email}: ${(err as Error).message}`);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      updatedCount,
      skippedCount,
      totalProcessed: contacts.length,
      errors: errors.slice(0, 10),
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error during import" },
      { status: 500 }
    );
  }
}
