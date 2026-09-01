import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/types/database";

export type Message = Database["public"]["Tables"]["messages"]["Row"] & { is_internal?: boolean };
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
  channels?: { id: string; display_name: string; platform: string; is_active: boolean };
};

/**
 * Hook to fetch messages for a specific conversation with instant memory caching
 */
export function useConversationMessages(conversationId: string | null) {
  return useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await fetch(`/api/v1/messages?conversationId=${conversationId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      return res.json();
    },
    enabled: Boolean(conversationId),
    staleTime: 1000 * 30, // 30 seconds fresh
    gcTime: 1000 * 60 * 15, // Cache for 15 minutes
  });
}

/**
 * Mutation to update conversation status (e.g. open, closed, archived, snoozed)
 */
export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      status,
    }: {
      conversationId: string;
      status: string;
    }) => {
      const res = await fetch(`/api/v1/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error("Failed to update status");
      }
      return res.json();
    },
    onSuccess: (_data, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
    },
  });
}

/**
 * Mutation to delete a conversation
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await fetch(`/api/v1/conversations/${conversationId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete conversation");
      }
      return res.json();
    },
    onSuccess: (_data, conversationId) => {
      queryClient.removeQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
