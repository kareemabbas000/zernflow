import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/types/database";
import type { FlowNode, FlowEdge, FlowExecutionContext } from "./types";
import { nodeRegistry } from "./registry";
import { cancelUnresumableSession, completeSession, FlowLoadError } from "./utils";

export async function executeFlow(
  supabase: SupabaseClient<Database>,
  context: FlowExecutionContext
) {
  // Ensure variables always exists so nodes can write outputs
  context.variables ??= {};

  // Seed {{message}} from incoming message text
  if (context.incomingMessage.text) {
    context.variables.message ??= context.incomingMessage.text;
  }

  // Check for active session waiting for input
  const { data: activeSession } = await supabase
    .from("flow_sessions")
    .select("*")
    .eq("contact_id", context.contactId)
    .eq("channel_id", context.channelId)
    .eq("status", "active")
    .eq("waiting_for_input", true)
    .single();

  if (activeSession) {
    return resumeSession(supabase, activeSession, context);
  }

  // Load flow
  const { data: flow } = await supabase
    .from("flows")
    .select("*")
    .eq("id", context.flowId)
    .eq("status", "published")
    .single();

  if (!flow) return;

  const nodes = flow.nodes as unknown as FlowNode[];
  const edges = flow.edges as unknown as FlowEdge[];

  // Get channel platform and account ID
  const { data: channel } = await supabase
    .from("channels")
    .select("platform, late_account_id, zernio_account_id")
    .eq("id", context.channelId)
    .single();

  context.platform = channel?.platform as FlowExecutionContext["platform"];
  const accountId = channel?.zernio_account_id || channel?.late_account_id;
  if (accountId && !context.lateAccountId) {
    context.lateAccountId = accountId;
  }

  // Resolve late_conversation_id if missing
  if (!context.lateConversationId && context.conversationId) {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("late_conversation_id")
      .eq("id", context.conversationId)
      .single();

    if (conversation?.late_conversation_id) {
      context.lateConversationId = conversation.late_conversation_id;
    }
  }

  // Create session
  const { data: session } = await supabase
    .from("flow_sessions")
    .insert({
      contact_id: context.contactId,
      flow_id: context.flowId,
      channel_id: context.channelId,
      status: "active",
      variables: context.variables || {},
    })
    .select("id")
    .single();

  if (!session) return;

  // Track flow_started
  await supabase.from("analytics_events").insert({
    workspace_id: context.workspaceId,
    flow_id: context.flowId,
    contact_id: context.contactId,
    event_type: "flow_started",
    metadata: { triggerId: context.triggerId },
  });

  // Find the trigger node (entry point)
  const triggerNode = nodes.find((n) => n.type === "trigger");
  if (!triggerNode) return;

  // Get the first connected node
  const firstEdge = edges.find((e) => e.source === triggerNode.id);
  if (!firstEdge) return;

  const startNode = nodes.find((n) => n.id === firstEdge.target);
  if (!startNode) return;

  await traverseNodes(supabase, session.id, startNode, nodes, edges, context, 0);
}

const MAX_TRAVERSAL_DEPTH = 50;

export { FlowLoadError, resumeSession };

async function resumeSession(
  supabase: SupabaseClient<Database>,
  session: Database["public"]["Tables"]["flow_sessions"]["Row"],
  context: FlowExecutionContext
) {
  const { data: flow, error: flowError } = await supabase
    .from("flows")
    .select("*")
    .eq("id", session.flow_id)
    .single();

  if (!flow) {
    if (flowError && flowError.code !== "PGRST116") {
      throw new FlowLoadError(
        `flow ${session.flow_id} could not be loaded: ${flowError.message}`
      );
    }
    await cancelUnresumableSession(
      supabase,
      session.id,
      `flow ${session.flow_id} no longer exists`
    );
    return;
  }

  const nodes = flow.nodes as unknown as FlowNode[];
  const edges = flow.edges as unknown as FlowEdge[];

  const { data: channel } = await supabase
    .from("channels")
    .select("platform, late_account_id, zernio_account_id")
    .eq("id", context.channelId)
    .single();

  context.platform = channel?.platform as FlowExecutionContext["platform"];
  const resumeAccId = channel?.zernio_account_id || channel?.late_account_id;
  if (resumeAccId && !context.lateAccountId) {
    context.lateAccountId = resumeAccId;
  }

  if (!context.lateConversationId && context.conversationId) {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("late_conversation_id")
      .eq("id", context.conversationId)
      .single();

    if (conversation?.late_conversation_id) {
      context.lateConversationId = conversation.late_conversation_id;
    }
  }

  context.variables = (session.variables as Record<string, string>) || {};

  if (context.incomingMessage.text) {
    context.variables.message = context.incomingMessage.text;
    context.variables.last_message = context.incomingMessage.text;
    context.variables.input = context.incomingMessage.text;
  }

  await supabase
    .from("flow_sessions")
    .update({ waiting_for_input: false, waiting_until: null, variables: (context.variables ?? {}) as Json })
    .eq("id", session.id);

  const currentNode = nodes.find((n) => n.id === session.current_node_id);
  if (!currentNode) {
    await cancelUnresumableSession(
      supabase,
      session.id,
      `node ${session.current_node_id} no longer exists in flow ${session.flow_id}`
    );
    return;
  }

  const nextEdge = edges.find((e) => e.source === currentNode.id);
  if (!nextEdge) {
    await completeSession(supabase, session.id);
    return;
  }

  const nextNode = nodes.find((n) => n.id === nextEdge.target);
  if (!nextNode) {
    await completeSession(supabase, session.id);
    return;
  }

  await traverseNodes(supabase, session.id, nextNode, nodes, edges, context, 0);
}

async function traverseNodes(
  supabase: SupabaseClient<Database>,
  sessionId: string,
  node: FlowNode,
  nodes: FlowNode[],
  edges: FlowEdge[],
  context: FlowExecutionContext,
  depth: number = 0
) {
  if (depth >= MAX_TRAVERSAL_DEPTH) {
    console.error(`Flow traversal exceeded max depth (${MAX_TRAVERSAL_DEPTH}), stopping. Flow: ${context.flowId}`);
    await completeSession(supabase, sessionId);
    return;
  }
  
  await supabase
    .from("flow_sessions")
    .update({ current_node_id: node.id })
    .eq("id", sessionId);

  await supabase.from("analytics_events").insert({
    workspace_id: context.workspaceId,
    flow_id: context.flowId,
    contact_id: context.contactId,
    event_type: "node_executed",
    metadata: { nodeId: node.id, nodeType: node.type },
  });

  // Execute the node using the registry
  const handlerKey = node.type === "action" ? (node.data as any)?.actionType : node.type;
  const handler = handlerKey ? nodeRegistry[handlerKey] : undefined;
  
  let result;
  if (handler) {
    result = await handler(supabase, node, context, sessionId);
  } else {
    console.warn(`No handler registered for node type: ${node.type} (actionType: ${(node.data as any)?.actionType})`);
  }

  // Persist variables written by output-producing nodes
  if (node.type === "aiResponse" || node.type === "httpRequest" || node.type === "setCustomField") {
    await supabase
      .from("flow_sessions")
      .update({ variables: (context.variables ?? {}) as Json })
      .eq("id", sessionId);
  }

  if (result === "pause") return;

  // Find next node(s)
  let nextEdge: FlowEdge | undefined;

  if (result && typeof result === "string" && result.startsWith("handle:")) {
    const handle = result.replace("handle:", "");
    nextEdge = edges.find(
      (e) => e.source === node.id && e.sourceHandle === handle
    );
  } else {
    nextEdge = edges.find((e) => e.source === node.id);
  }

  if (!nextEdge) {
    await completeSession(supabase, sessionId);
    return;
  }

  const nextNode = nodes.find((n) => n.id === nextEdge!.target);
  if (!nextNode) {
    await completeSession(supabase, sessionId);
    return;
  }

  await traverseNodes(supabase, sessionId, nextNode, nodes, edges, context, depth + 1);
}
