"use client";

import { useState } from "react";
import { Search, Building2, CreditCard, Save, Loader2, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SubscriptionsView({ workspaces }: { workspaces: any[] }) {
  const [search, setSearch] = useState("");
  const [data, setData] = useState(workspaces);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimits, setEditLimits] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const filtered = data.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.id.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave(wsId: string) {
    setLoading(true);
    const { error } = await supabase
      .from("workspaces")
      .update({
        limits: editLimits
      })
      .eq("id", wsId);
      
    if (!error) {
      setData(data.map(w => w.id === wsId ? { ...w, limits: editLimits } : w));
      setEditingId(null);
    } else {
      alert("Failed to update limits");
    }
    setLoading(false);
  }

  function startEdit(ws: any) {
    setEditingId(ws.id);
    setEditLimits(ws.limits || {
      max_channels: 1,
      max_contacts: 1000,
      max_flows: 5
    });
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions & Quotas</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage workspace limits, plans, and feature access.</p>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search workspaces..."
          className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Workspace</th>
              <th className="px-5 py-3 font-semibold">Current Plan</th>
              <th className="px-5 py-3 font-semibold">Channels Usage</th>
              <th className="px-5 py-3 font-semibold">Contacts Usage</th>
              <th className="px-5 py-3 font-semibold">Flows Usage</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                  No workspaces found
                </td>
              </tr>
            ) : (
              filtered.map(ws => {
                const limits = ws.limits || { max_channels: 1, max_contacts: 1000, max_flows: 5 };
                const isEditing = editingId === ws.id;
                
                return (
                  <tr key={ws.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-foreground">{ws.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{ws.id.split("-")[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-semibold capitalize">
                        <CreditCard className="h-3 w-3" />
                        {ws.plan || 'Free'}
                      </span>
                    </td>
                    
                    {/* Channels Usage */}
                    <td className="px-5 py-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ws.usage.channels}</span> / 
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editLimits.max_channels}
                            onChange={(e) => setEditLimits({...editLimits, max_channels: parseInt(e.target.value)})}
                            className="w-16 rounded border px-1 py-0.5"
                          />
                        ) : (
                          <span className="text-muted-foreground">{limits.max_channels}</span>
                        )}
                      </div>
                      <div className="mt-1 h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full ${ws.usage.channels >= limits.max_channels ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(100, (ws.usage.channels / limits.max_channels) * 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Contacts Usage */}
                    <td className="px-5 py-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ws.usage.contacts}</span> / 
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editLimits.max_contacts}
                            onChange={(e) => setEditLimits({...editLimits, max_contacts: parseInt(e.target.value)})}
                            className="w-20 rounded border px-1 py-0.5"
                          />
                        ) : (
                          <span className="text-muted-foreground">{limits.max_contacts}</span>
                        )}
                      </div>
                      <div className="mt-1 h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full ${ws.usage.contacts >= limits.max_contacts ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(100, (ws.usage.contacts / limits.max_contacts) * 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Flows Usage */}
                    <td className="px-5 py-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ws.usage.flows}</span> / 
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editLimits.max_flows}
                            onChange={(e) => setEditLimits({...editLimits, max_flows: parseInt(e.target.value)})}
                            className="w-16 rounded border px-1 py-0.5"
                          />
                        ) : (
                          <span className="text-muted-foreground">{limits.max_flows}</span>
                        )}
                      </div>
                      <div className="mt-1 h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full ${ws.usage.flows >= limits.max_flows ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(100, (ws.usage.flows / limits.max_flows) * 100)}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-5 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSave(ws.id)}
                            disabled={loading}
                            className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                          >
                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(ws)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          Edit Limits
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
