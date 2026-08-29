import { getWorkspace } from "@/lib/workspace";
import { SettingsView } from "./settings-view";

export default async function SettingsPage() {
  const { workspace } = await getWorkspace();

  return (
    <SettingsView
      workspace={{
        id: workspace.id,
        name: workspace.name,
        plan: workspace.plan || "free",
        status: workspace.status || "active",
        hasAiKey: !!workspace.ai_api_key,
        globalKeywords: (workspace.global_keywords as string[]) ?? [],
      }}
    />
  );
}
