import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { WORKSPACE_COOKIE } from "@/lib/workspace";

async function getRequestWorkspace(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const cookieStore = await cookies();
  const selectedId = cookieStore.get(WORKSPACE_COOKIE)?.value;

  if (selectedId) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .eq("workspace_id", selectedId)
      .maybeSingle();

    if (membership) return membership.workspace_id;
  }

  const { data: fallback } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  return fallback?.workspace_id || null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = await getRequestWorkspace(supabase, user.id);
  if (!workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const { data: flows, error } = await supabase
    .from("flows")
    .select("id, name, description, status, version, published_at, created_at, updated_at")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(flows ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = await getRequestWorkspace(supabase, user.id);
  if (!workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const body = await request.json();

  const defaultNodes = body.nodes && body.nodes.length > 0
    ? body.nodes
    : [
        {
          id: `node_${Date.now()}_0`,
          type: "trigger",
          position: { x: 250, y: 150 },
          data: { triggerType: "keyword", keywords: [] },
        },
      ];

  const { data: flow, error } = await supabase
    .from("flows")
    .insert({
      workspace_id: workspaceId,
      name: body.name || "Untitled Flow",
      description: body.description || null,
      nodes: defaultNodes,
      edges: body.edges || [],
    })
    .select("id, name, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(flow, { status: 201 });
}
