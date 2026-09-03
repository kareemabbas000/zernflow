import { getWorkspace } from "@/lib/workspace";
import { FlowsView } from "@/components/flows/flows-view";

export default async function FlowsPage() {
  const { workspace, supabase } = await getWorkspace();

  const [{ data: flows }, { data: channels }, { count: channelCount }] = await Promise.all([
    supabase
      .from("flows")
      .select("id, name, description, status, updated_at, version, nodes, edges")
      .eq("workspace_id", workspace.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("channels")
      .select("id, platform, display_name, username")
      .eq("workspace_id", workspace.id)
      .eq("is_active", true),
    supabase
      .from("channels")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspace.id)
      .eq("is_active", true),
  ]);

  return (
    <FlowsView
      initialFlows={flows ?? []}
      channels={channels ?? []}
      channelCount={channelCount ?? 0}
    />
  );
}
