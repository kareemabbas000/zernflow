import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const tag = searchParams.get("tag");
  const subscribed = searchParams.get("subscribed");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const { data: matchedIds, error: searchError } = await (supabase as any).rpc("search_workspace_contacts", {
    ws_id: membership.workspace_id,
    search_query: search || null,
    tag_name: tag || null,
    req_is_subscribed: subscribed === "true" ? true : subscribed === "false" ? false : null,
    max_limit: limit,
    row_offset: offset,
  });

  if (searchError) return NextResponse.json({ error: searchError.message }, { status: 500 });

  if (!matchedIds || matchedIds.length === 0) {
    return NextResponse.json({ contacts: [], total: 0 });
  }

  const totalCount = matchedIds[0].total_count;
  const ids = matchedIds.map((row: { contact_id: string }) => row.contact_id);

  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*, contact_tags(tag_id, tags(id, name, color)), contact_channels(platform_sender_id, channel_id, channels(platform))")
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Re-sort correctly because .in() loses order
  const sorted = ids
    .map((id: string) => contacts?.find(c => c.id === id))
    .filter(Boolean);

  return NextResponse.json({ contacts: sorted, total: totalCount });
}
