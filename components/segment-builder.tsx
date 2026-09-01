"use client";

import { useState, useEffect } from "react";
import { Plus, X, ChevronDown, Filter, Users, Tag as TagIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/platforms";

type Tag = Database["public"]["Tables"]["tags"]["Row"];

// --- Filter types ---

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "gt"
  | "lt"
  | "before"
  | "after"
  | "within"
  | "older_than";

export type FilterField =
  | "has_tag"
  | "missing_tag"
  | "lead_stage"
  | "platform"
  | "last_interaction"
  | "has_phone"
  | "has_username"
  | "is_subscribed";

export interface FilterRule {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: string;
}

export interface FilterGroup {
  id: string;
  combinator: "and" | "or";
  rules: FilterRule[];
}

export interface SegmentFilter {
  combinator: "and" | "or";
  groups: FilterGroup[];
}

// --- Operator options per field ---

const fieldConfig: Record<
  FilterField,
  {
    label: string;
    operators: { value: FilterOperator; label: string }[];
    valueType: "tag" | "lead_stage" | "platform" | "interaction_window" | "boolean" | "text";
  }
> = {
  has_tag: {
    label: "Has Tag",
    operators: [{ value: "equals", label: "is tagged with" }],
    valueType: "tag",
  },
  missing_tag: {
    label: "Missing Tag",
    operators: [{ value: "equals", label: "does not have tag" }],
    valueType: "tag",
  },
  lead_stage: {
    label: "Lead Stage / Pipeline",
    operators: [
      { value: "equals", label: "is" },
      { value: "not_equals", label: "is not" },
    ],
    valueType: "lead_stage",
  },
  platform: {
    label: "Platform / Channel",
    operators: [
      { value: "equals", label: "is connected on" },
      { value: "not_equals", label: "is not on" },
    ],
    valueType: "platform",
  },
  last_interaction: {
    label: "Last Active / Interaction",
    operators: [
      { value: "within", label: "within last" },
      { value: "older_than", label: "older than" },
    ],
    valueType: "interaction_window",
  },
  has_phone: {
    label: "Has Phone Number",
    operators: [{ value: "equals", label: "is" }],
    valueType: "boolean",
  },
  has_username: {
    label: "Has Social Handle / Username",
    operators: [{ value: "equals", label: "is" }],
    valueType: "boolean",
  },
  is_subscribed: {
    label: "Opt-In / Subscription Status",
    operators: [{ value: "equals", label: "is" }],
    valueType: "boolean",
  },
};

const LEAD_STAGES = [
  { value: "lead", label: "Lead (New Inquiry)" },
  { value: "qualified", label: "Qualified Prospect" },
  { value: "customer", label: "Paying Customer" },
  { value: "vip", label: "VIP Client" },
  { value: "churned", label: "Inactive / Churned" },
];

const INTERACTION_WINDOWS = [
  { value: "24h", label: "24 Hours (Active Window)" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function createEmptyRule(): FilterRule {
  return {
    id: generateId(),
    field: "has_tag",
    operator: "equals",
    value: "",
  };
}

function createEmptyGroup(): FilterGroup {
  return {
    id: generateId(),
    combinator: "and",
    rules: [createEmptyRule()],
  };
}

export function createEmptyFilter(): SegmentFilter {
  return {
    combinator: "and",
    groups: [createEmptyGroup()],
  };
}

// --- Components ---

function CombinatorToggle({
  value,
  onChange,
}: {
  value: "and" | "or";
  onChange: (v: "and" | "or") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
      <button
        type="button"
        onClick={() => onChange("and")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer",
          value === "and"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        AND (All match)
      </button>
      <button
        type="button"
        onClick={() => onChange("or")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer",
          value === "or"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        OR (Any match)
      </button>
    </div>
  );
}

function FilterRuleRow({
  rule,
  tags,
  onChange,
  onRemove,
  canRemove,
}: {
  rule: FilterRule;
  tags: Tag[];
  onChange: (rule: FilterRule) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const config = fieldConfig[rule.field] || fieldConfig.has_tag;
  const operators = config.operators;

  function handleFieldChange(field: FilterField) {
    const newConfig = fieldConfig[field];
    onChange({
      ...rule,
      field,
      operator: newConfig.operators[0].value,
      value:
        field === "lead_stage"
          ? "lead"
          : field === "platform"
          ? "instagram"
          : field === "last_interaction"
          ? "24h"
          : field === "has_phone" || field === "has_username" || field === "is_subscribed"
          ? "true"
          : "",
    });
  }

  function renderValueInput() {
    switch (config.valueType) {
      case "tag":
        return (
          <select
            value={rule.value}
            onChange={(e) => onChange({ ...rule, value: e.target.value })}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">Select a tag...</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                🏷️ {tag.name}
              </option>
            ))}
          </select>
        );

      case "lead_stage":
        return (
          <select
            value={rule.value || "lead"}
            onChange={(e) => onChange({ ...rule, value: e.target.value })}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {LEAD_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        );

      case "platform":
        return (
          <select
            value={rule.value || "instagram"}
            onChange={(e) => onChange({ ...rule, value: e.target.value })}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABELS[p]}
              </option>
            ))}
          </select>
        );

      case "interaction_window":
        return (
          <select
            value={rule.value || "24h"}
            onChange={(e) => onChange({ ...rule, value: e.target.value })}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {INTERACTION_WINDOWS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        );

      case "boolean":
        return (
          <select
            value={rule.value || "true"}
            onChange={(e) => onChange({ ...rule, value: e.target.value })}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="true">Yes / Verified</option>
            <option value="false">No / Not Set</option>
          </select>
        );

      default:
        return (
          <input
            type="text"
            placeholder="Value..."
            value={rule.value}
            onChange={(e) => onChange({ ...rule, value: e.target.value })}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap rounded-xl border border-border/60 bg-card/60 p-2 shadow-2xs">
      {/* Field selector */}
      <select
        value={rule.field}
        onChange={(e) => handleFieldChange(e.target.value as FilterField)}
        className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
      >
        {(Object.entries(fieldConfig) as [FilterField, typeof config][]).map(
          ([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          )
        )}
      </select>

      {/* Operator selector */}
      {operators.length > 1 && (
        <select
          value={rule.operator}
          onChange={(e) =>
            onChange({ ...rule, operator: e.target.value as FilterOperator })
          }
          className="rounded-xl border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      )}

      {/* Value input */}
      {renderValueInput()}

      {/* Remove button */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors cursor-pointer"
          title="Remove rule"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function FilterGroupCard({
  group,
  groupIndex,
  totalGroups,
  tags,
  onChange,
  onRemove,
  canRemove,
}: {
  group: FilterGroup;
  groupIndex: number;
  totalGroups: number;
  tags: Tag[];
  onChange: (group: FilterGroup) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  function handleCombinatorChange(combinator: "and" | "or") {
    onChange({ ...group, combinator });
  }

  function handleAddRule() {
    onChange({
      ...group,
      rules: [...group.rules, createEmptyRule()],
    });
  }

  function handleRuleChange(index: number, updatedRule: FilterRule) {
    const nextRules = [...group.rules];
    nextRules[index] = updatedRule;
    onChange({ ...group, rules: nextRules });
  }

  function handleRemoveRule(index: number) {
    if (group.rules.length <= 1) return;
    onChange({
      ...group,
      rules: group.rules.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
      {/* Group header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-foreground">
            Filter Group {totalGroups > 1 ? `#${groupIndex + 1}` : ""}
          </span>
          {group.rules.length > 1 && (
            <CombinatorToggle
              value={group.combinator}
              onChange={handleCombinatorChange}
            />
          )}
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>Remove Group</span>
          </button>
        )}
      </div>

      {/* Rules list */}
      <div className="space-y-2">
        {group.rules.map((rule, ruleIndex) => (
          <FilterRuleRow
            key={rule.id}
            rule={rule}
            tags={tags}
            onChange={(r) => handleRuleChange(ruleIndex, r)}
            onRemove={() => handleRemoveRule(ruleIndex)}
            canRemove={group.rules.length > 1}
          />
        ))}
      </div>

      {/* Add rule button */}
      <button
        type="button"
        onClick={handleAddRule}
        className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Targeting Rule
      </button>
    </div>
  );
}

// --- Main Component ---

interface SegmentBuilderProps {
  workspaceId: string;
  value: SegmentFilter;
  onChange: (filter: SegmentFilter) => void;
}

export function SegmentBuilder({
  workspaceId,
  value,
  onChange,
}: SegmentBuilderProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: tagData } = await supabase
        .from("tags")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("name");

      setTags(tagData ?? []);
    }
    loadData();
  }, [workspaceId]);

  const filter = value?.groups?.length ? value : createEmptyFilter();

  function handleCombinatorChange(combinator: "and" | "or") {
    onChange({ ...filter, combinator });
  }

  function handleAddGroup() {
    onChange({
      ...filter,
      groups: [...filter.groups, createEmptyGroup()],
    });
  }

  function handleGroupChange(index: number, updatedGroup: FilterGroup) {
    const nextGroups = [...filter.groups];
    nextGroups[index] = updatedGroup;
    onChange({ ...filter, groups: nextGroups });
  }

  function handleRemoveGroup(index: number) {
    if (filter.groups.length <= 1) return;
    onChange({
      ...filter,
      groups: filter.groups.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-3">
      {/* Top-level combinator (if multiple groups) */}
      {filter.groups.length > 1 && (
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
          <span className="text-xs font-bold text-foreground">
            Match between Groups:
          </span>
          <CombinatorToggle
            value={filter.combinator}
            onChange={handleCombinatorChange}
          />
        </div>
      )}

      {/* Groups */}
      <div className="space-y-3">
        {filter.groups.map((group, groupIndex) => (
          <FilterGroupCard
            key={group.id}
            group={group}
            groupIndex={groupIndex}
            totalGroups={filter.groups.length}
            tags={tags}
            onChange={(g) => handleGroupChange(groupIndex, g)}
            onRemove={() => handleRemoveGroup(groupIndex)}
            canRemove={filter.groups.length > 1}
          />
        ))}
      </div>

      {/* Add group button */}
      <button
        type="button"
        onClick={handleAddGroup}
        className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Add Target Segment Group
      </button>
    </div>
  );
}
