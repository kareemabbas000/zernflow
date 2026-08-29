import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { WORKSPACE_COOKIE } from "@/lib/workspace";

async function getWorkspaceId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const selectedId = cookieStore.get(WORKSPACE_COOKIE)?.value;

  if (selectedId) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("workspace_id", selectedId)
      .maybeSingle();

    if (membership) return membership.workspace_id;
  }

  const { data: fallback } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return fallback?.workspace_id || null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  const { flowId } = await params;
  const supabase = await createClient();
  const workspaceId = await getWorkspaceId(supabase);
  if (!workspaceId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: flow, error } = await supabase
    .from("flows")
    .select("*, triggers(*)")
    .eq("id", flowId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !flow)
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });

  return NextResponse.json(flow);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  const { flowId } = await params;
  const supabase = await createClient();
  const workspaceId = await getWorkspaceId(supabase);
  if (!workspaceId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.description !== undefined) update.description = body.description;
  if (body.nodes !== undefined) update.nodes = body.nodes;
  if (body.edges !== undefined) update.edges = body.edges;
  if (body.viewport !== undefined) update.viewport = body.viewport;

  const { data: flow, error } = await supabase
    .from("flows")
    .update(update)
    .eq("id", flowId)
    .eq("workspace_id", workspaceId)
    .select("id, name, status, updated_at")
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(flow);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  const { flowId } = await params;
  const supabase = await createClient();
  const workspaceId = await getWorkspaceId(supabase);
  if (!workspaceId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("flows")
    .delete()
    .eq("id", flowId)
    .eq("workspace_id", workspaceId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
