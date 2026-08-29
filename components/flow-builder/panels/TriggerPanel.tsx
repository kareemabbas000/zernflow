import { useCallback, useState, useEffect } from "react";
import { Plus, X, Globe, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { PlatformIcon } from "@/components/platform-icon";
import type { TriggerType, Platform } from "@/lib/types/database";

interface Keyword {
  value: string;
  matchType: "exact" | "contains" | "startsWith";
}

interface TriggerPanelData {
  triggerType?: string;
  channelId?: string | null;
  keywords?: Keyword[];
  payload?: string;
  alsoMatchInDms?: boolean;
  [key: string]: unknown;
}

interface TriggerPanelProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

interface ChannelOption {
  id: string;
  platform: Platform;
  display_name: string | null;
  username: string | null;
}

const triggerTypes: Array<{ value: TriggerType; label: string; description: string }> = [
  { value: "keyword", label: "Keyword", description: "Triggered when a user sends a matching keyword" },
  { value: "postback", label: "Button Click", description: "Triggered when a user clicks a button" },
  { value: "quick_reply", label: "Quick Reply", description: "Triggered when a user taps a quick reply" },
  { value: "welcome", label: "Welcome Message", description: "Triggered when a user starts a conversation" },
  { value: "default", label: "Default Reply", description: "Triggered when no other trigger matches" },
  { value: "comment_keyword", label: "Comment Keyword", description: "Triggered by keywords in post comments" },
];

const matchTypes: Array<{ value: "exact" | "contains" | "startsWith"; label: string }> = [
  { value: "exact", label: "Exact match" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
];

export function TriggerPanel({ data: rawData, onChange }: TriggerPanelProps) {
  const data = rawData as TriggerPanelData;
  const triggerType = data.triggerType || "keyword";
  const selectedChannelId = (data.channelId as string) || "";
  const keywords = data.keywords || [];
  const [channels, setChannels] = useState<ChannelOption[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newMatchType, setNewMatchType] = useState<"exact" | "contains" | "startsWith">("contains");

  useEffect(() => {
    async function loadChannels() {
      const supabase = createClient();
      const { data: list } = await supabase
        .from("channels")
        .select("id, platform, display_name, username")
        .eq("is_active", true);
      if (list) setChannels(list as unknown as ChannelOption[]);
    }
    loadChannels();
  }, []);

  const handleChannelChange = useCallback(
    (channelId: string) => {
      onChange({ ...data, channelId: channelId || null });
    },
    [data, onChange]
  );

  const handleTriggerTypeChange = useCallback(
    (type: string) => {
      onChange({ ...data, triggerType: type });
    },
    [data, onChange]
  );

  const addKeyword = useCallback(() => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;
    const updated: Keyword[] = [...keywords, { value: trimmed, matchType: newMatchType }];
    onChange({ ...data, keywords: updated });
    setNewKeyword("");
  }, [data, keywords, newKeyword, newMatchType, onChange]);

  const removeKeyword = useCallback(
    (index: number) => {
      const updated = keywords.filter((_, i) => i !== index);
      onChange({ ...data, keywords: updated });
    },
    [data, keywords, onChange]
  );

  const updateKeywordMatchType = useCallback(
    (index: number, matchType: "exact" | "contains" | "startsWith") => {
      const updated = keywords.map((k, i) => (i === index ? { ...k, matchType } : k));
      onChange({ ...data, keywords: updated });
    },
    [data, keywords, onChange]
  );

  const showKeywords = triggerType === "keyword" || triggerType === "comment_keyword";
  const showPayload = triggerType === "postback" || triggerType === "quick_reply";

  return (
    <div className="space-y-5">
      {/* Target Channel Selector / Autopilot Scope */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="h-4 w-4 text-primary animate-pulse" />
          <label className="text-xs font-bold text-foreground tracking-tight">
            Deploy to Channel (Autopilot)
          </label>
        </div>
        <select
          value={selectedChannelId}
          onChange={(e) => handleChannelChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 px-3 text-xs font-semibold text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">🌐 All Connected Channels (Workspace-wide)</option>
          {channels.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.platform.toUpperCase()}: {ch.username ? `@${ch.username.replace(/^@/, "")}` : ch.display_name || "Channel"}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
          {selectedChannelId
            ? "⚡ This flow will run on autopilot exclusively for the selected channel."
            : "⚡ This flow is active across all connected social channels in this workspace."}
        </p>
      </div>
      {/* Trigger Type */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-foreground">
          Trigger Type
        </label>
        <div className="space-y-1.5">
          {triggerTypes.map((t) => (
            <label
              key={t.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                triggerType === t.value
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-border bg-card hover:border-input"
              )}
            >
              <input
                type="radio"
                name="triggerType"
                value={t.value}
                checked={triggerType === t.value}
                onChange={() => handleTriggerTypeChange(t.value)}
                className="mt-0.5 h-4 w-4 border-input text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Keywords Section */}
      {showKeywords && (
        <div>
          <label className="mb-2 block text-xs font-semibold text-foreground">
            Keywords
          </label>

          {/* Existing keywords */}
          {keywords.length > 0 && (
            <div className="mb-3 space-y-2">
              {keywords.map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
                >
                  <span className="flex-1 truncate text-sm text-foreground">
                    {keyword.value}
                  </span>
                  <select
                    value={keyword.matchType}
                    onChange={(e) =>
                      updateKeywordMatchType(index, e.target.value as "exact" | "contains" | "startsWith")
                    }
                    className="rounded border border-border bg-muted px-2 py-1 text-xs text-foreground"
                  >
                    {matchTypes.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="rounded p-1 text-muted-foreground/60 hover:bg-muted hover:text-muted-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new keyword */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              placeholder="Enter keyword..."
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <select
              value={newMatchType}
              onChange={(e) => setNewMatchType(e.target.value as "exact" | "contains" | "startsWith")}
              className="rounded-lg border border-border bg-card px-2 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {matchTypes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addKeyword}
              disabled={!newKeyword.trim()}
              className="rounded-lg bg-emerald-500 p-2 text-white transition-colors hover:bg-emerald-600 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {keywords.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Add keywords that will trigger this flow. Press Enter or click + to add.
            </p>
          )}

          {/* Comment keywords only: publish also writes a `keyword` trigger row so
              the same flow answers people who DM the keyword instead of commenting. */}
          {triggerType === "comment_keyword" && (
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-card p-3">
              <input
                type="checkbox"
                checked={data.alsoMatchInDms === true}
                onChange={(e) => onChange({ ...data, alsoMatchInDms: e.target.checked })}
                disabled={keywords.length === 0}
                className="mt-0.5 h-4 w-4 rounded border-input text-emerald-500 focus:ring-emerald-500 disabled:opacity-40"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Also match in DMs</p>
                <p className="text-xs text-muted-foreground">
                  {keywords.length === 0
                    ? "Add at least one keyword to use this."
                    : "Run this flow when someone sends a keyword as a direct message, not just as a comment."}
                </p>
                {data.alsoMatchInDms === true && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    A DM has no comment behind it, so public replies and the comment
                    variables ({"{{comment_text}}"}, {"{{post_id}}"}) are empty on that run.
                  </p>
                )}
              </div>
            </label>
          )}
        </div>
      )}

      {/* Payload Section */}
      {showPayload && (
        <div>
          <label className="mb-2 block text-xs font-semibold text-foreground">
            Payload
          </label>
          <input
            type="text"
            value={data.payload || ""}
            onChange={(e) => onChange({ ...data, payload: e.target.value })}
            placeholder="Enter payload value..."
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            The payload value to match when a {triggerType === "postback" ? "button is clicked" : "quick reply is tapped"}.
          </p>
        </div>
      )}
    </div>
  );
}
