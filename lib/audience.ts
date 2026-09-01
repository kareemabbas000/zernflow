import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Platform } from "@/lib/types/database";

export interface SegmentRule {
  field: string;
  operator: string;
  value: string;
}

export interface SegmentGroup {
  combinator: "and" | "or";
  rules: SegmentRule[];
}

export interface SegmentFilter {
  combinator: "and" | "or";
  groups: SegmentGroup[];
}

/**
 * Resolve segment filter into contact IDs.
 * If no filter, returns all subscribed contacts in the workspace.
 */
export async function resolveContacts(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  filter: SegmentFilter | null
): Promise<string[]> {
  // No filter = all active subscribed contacts in workspace
  if (!filter || !filter.groups?.length) {
    const { data } = await supabase
      .from("contacts")
      .select("id")
      .eq("workspace_id", workspaceId)
      .neq("is_subscribed", false)
      .limit(10000);
    return (data ?? []).map((c) => c.id);
  }

  // Start with all subscribed contacts
  const { data: allContacts } = await supabase
    .from("contacts")
    .select("id")
    .eq("workspace_id", workspaceId)
    .neq("is_subscribed", false)
    .limit(10000);

  if (!allContacts?.length) return [];

  const allIds = new Set(allContacts.map((c) => c.id));

  // Evaluate each group
  const groupResults: Set<string>[] = [];

  for (const group of filter.groups) {
    const ruleResults: Set<string>[] = [];

    for (const rule of group.rules) {
      const ids = await evaluateRule(supabase, workspaceId, rule, allIds);
      ruleResults.push(ids);
    }

    // Combine rules within group
    let groupIds: Set<string>;
    if (group.combinator === "and") {
      groupIds = intersectSets(ruleResults);
    } else {
      groupIds = unionSets(ruleResults);
    }
    groupResults.push(groupIds);
  }

  // Combine groups
  let finalIds: Set<string>;
  if (filter.combinator === "and") {
    finalIds = intersectSets(groupResults);
  } else {
    finalIds = unionSets(groupResults);
  }

  return Array.from(finalIds);
}

async function evaluateRule(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  rule: SegmentRule,
  allContactIds: Set<string>
): Promise<Set<string>> {
  const contactIds = Array.from(allContactIds);

  switch (rule.field) {
    case "has_tag": {
      if (!rule.value) return new Set();

      const { data: tagged } = await supabase
        .from("contact_tags")
        .select("contact_id")
        .eq("tag_id", rule.value)
        .in("contact_id", contactIds);

      return new Set((tagged ?? []).map((t) => t.contact_id));
    }

    case "missing_tag": {
      if (!rule.value) return new Set(contactIds);

      const { data: tagged } = await supabase
        .from("contact_tags")
        .select("contact_id")
        .eq("tag_id", rule.value)
        .in("contact_id", contactIds);

      const taggedSet = new Set((tagged ?? []).map((t) => t.contact_id));
      return new Set(contactIds.filter((id) => !taggedSet.has(id)));
    }

    case "platform": {
      const { data: channels } = await supabase
        .from("channels")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("platform", rule.value as Platform);

      if (!channels?.length) {
        return rule.operator === "not_equals" ? new Set(contactIds) : new Set();
      }

      const channelIds = channels.map((c) => c.id);
      const { data: links } = await supabase
        .from("contact_channels")
        .select("contact_id")
        .in("channel_id", channelIds)
        .in("contact_id", contactIds);

      const linkedSet = new Set((links ?? []).map((l) => l.contact_id));
      if (rule.operator === "not_equals") {
        return new Set(contactIds.filter((id) => !linkedSet.has(id)));
      }
      return linkedSet;
    }

    case "is_subscribed": {
      // Already filtered to subscribed, but handle explicit false
      if (rule.value === "false") {
        return new Set(); // We only target subscribed contacts
      }
      return new Set(contactIds);
    }

    case "lead_stage": {
      const { data } = await supabase
        .from("contacts")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("lead_stage", rule.value)
        .in("id", contactIds);

      return new Set((data ?? []).map((c) => c.id));
    }

    case "has_phone": {
      const { data } = await supabase
        .from("contacts")
        .select("id")
        .eq("workspace_id", workspaceId)
        .not("phone", "is", null)
        .in("id", contactIds);

      return new Set((data ?? []).map((c) => c.id));
    }

    case "has_username": {
      const { data } = await supabase
        .from("contact_channels")
        .select("contact_id")
        .not("platform_username", "is", null)
        .in("contact_id", contactIds);

      return new Set((data ?? []).map((c) => c.contact_id));
    }

    case "last_interaction": {
      let date: string;
      if (rule.value === "24h") {
        date = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      } else if (rule.value === "7d") {
        date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (rule.value === "30d") {
        date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        date = new Date(rule.value).toISOString();
      }

      let query = supabase
        .from("contacts")
        .select("id")
        .eq("workspace_id", workspaceId)
        .in("id", contactIds);

      if (rule.operator === "before" || rule.operator === "older_than") {
        query = query.lt("last_interaction_at", date);
      } else {
        query = query.gt("last_interaction_at", date);
      }

      const { data } = await query;
      return new Set((data ?? []).map((c) => c.id));
    }

    case "custom_field": {
      // rule.value format: "field_slug:actual_value"
      const [slug, ...rest] = rule.value.split(":");
      const fieldValue = rest.join(":");

      const { data: fieldDef } = await supabase
        .from("custom_field_definitions")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("slug", slug)
        .single();

      if (!fieldDef) return new Set();

      let cfQuery = supabase
        .from("contact_custom_fields")
        .select("contact_id")
        .eq("field_id", fieldDef.id)
        .in("contact_id", contactIds);

      switch (rule.operator) {
        case "equals":
          cfQuery = cfQuery.eq("value", fieldValue);
          break;
        case "not_equals":
          cfQuery = cfQuery.neq("value", fieldValue);
          break;
        case "contains":
          cfQuery = cfQuery.ilike("value", `%${fieldValue}%`);
          break;
        case "gt":
          cfQuery = cfQuery.gt("value", fieldValue);
          break;
        case "lt":
          cfQuery = cfQuery.lt("value", fieldValue);
          break;
      }

      const { data } = await cfQuery;
      return new Set((data ?? []).map((c) => c.contact_id));
    }

    default:
      return new Set(contactIds);
  }
}

function intersectSets(sets: Set<string>[]): Set<string> {
  if (sets.length === 0) return new Set();
  const result = new Set(sets[0]);
  for (let i = 1; i < sets.length; i++) {
    for (const item of result) {
      if (!sets[i].has(item)) result.delete(item);
    }
  }
  return result;
}

function unionSets(sets: Set<string>[]): Set<string> {
  const result = new Set<string>();
  for (const s of sets) {
    for (const item of s) {
      result.add(item);
    }
  }
  return result;
}
