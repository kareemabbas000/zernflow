"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X, ShieldAlert, Flag, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function FeatureFlagsView({ initialFlags, workspaces }: { initialFlags: any[], workspaces: any[] }) {
  const [flags, setFlags] = useState(initialFlags);
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEnabled, setNewEnabled] = useState(false);
  const [newWorkspaceId, setNewWorkspaceId] = useState<string>("global");
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  async function handleAdd() {
    if (!newKey.trim()) return;
    setLoading(true);
    const wsId = newWorkspaceId === "global" ? null : newWorkspaceId;
    
    const { data, error } = await supabase
      .from("feature_flags")
      .insert({
        key: newKey.trim(),
        description: newDesc.trim() || null,
        enabled: newEnabled,
        workspace_id: wsId
      })
      .select()
      .single();

    if (!error && data) {
      setFlags([data, ...flags]);
      setIsAdding(false);
      setNewKey("");
      setNewDesc("");
      setNewWorkspaceId("global");
      setNewEnabled(false);
    } else {
      console.error(error);
      alert("Failed to add flag. Key might already exist for this scope.");
    }
    setLoading(false);
  }

  async function toggleFlag(id: string, currentVal: boolean) {
    const nextVal = !currentVal;
    // Optimistic
    setFlags(flags.map(f => f.id === id ? { ...f, enabled: nextVal } : f));
    
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled: nextVal })
      .eq("id", id);
      
    if (error) {
      // Revert
      setFlags(flags.map(f => f.id === id ? { ...f, enabled: currentVal } : f));
    }
  }

  async function deleteFlag(id: string) {
    if (!confirm("Are you sure you want to delete this feature flag?")) return;
    
    setFlags(flags.filter(f => f.id !== id));
    await supabase.from("feature_flags").delete().eq("id", id);
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage global and workspace-specific feature toggles.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? "Cancel" : "New Flag"}
        </button>
      </div>

      {isAdding && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Create Feature Flag</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold">Flag Key</label>
              <input
                type="text"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="e.g. new_dashboard_ui"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Short description"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Scope</label>
              <select
                value={newWorkspaceId}
                onChange={e => setNewWorkspaceId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="global">Global (All Workspaces)</option>
                {workspaces.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="checkbox"
                  checked={newEnabled}
                  onChange={e => setNewEnabled(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                Enabled by default
              </label>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              onClick={handleAdd}
              disabled={!newKey || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Flag
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Key</th>
              <th className="px-5 py-3 font-semibold">Scope</th>
              <th className="px-5 py-3 font-semibold">Description</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {flags.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                  No feature flags found
                </td>
              </tr>
            ) : (
              flags.map(flag => (
                <tr key={flag.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium font-mono text-xs">{flag.key}</td>
                  <td className="px-5 py-3">
                    {flag.workspace_id ? (
                      <span className="inline-flex items-center rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {workspaces.find(w => w.id === flag.workspace_id)?.name || 'Unknown'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        Global
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{flag.description || "-"}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleFlag(flag.id, flag.enabled)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                        flag.enabled 
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950/60 dark:text-green-300"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {flag.enabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {flag.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => deleteFlag(flag.id)}
                      className="inline-flex rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Delete Flag"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
