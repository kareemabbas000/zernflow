with open("components/providers/global-live-sync-provider.tsx", "r") as f:
    text = f.read()

# Make sure useInboxStore is imported
if "useInboxStore" not in text:
    text = text.replace('import { useToast } from "@/components/ui/use-toast";', 'import { useToast } from "@/components/ui/use-toast";\nimport { useInboxStore } from "@/lib/stores/inbox-store";')

old_trigger = """  const triggerNotification = useCallback(
    (conv: Conversation) => {
      if (soundEnabled) {
        soundManager.playMessageChime();
      }

      const senderName ="""

new_trigger = """  const triggerNotification = useCallback(
    (conv: Conversation) => {
      const { isSoundMuted, isToastsMuted } = useInboxStore.getState();

      if (soundEnabled && !isSoundMuted) {
        soundManager.playMessageChime();
      }

      const senderName ="""

text = text.replace(old_trigger, new_trigger)

old_active_toast = """      setActiveToast({
        id: `toast-${Date.now()}`,
        conversationId: conv.id,
        senderName,
        preview,
        platform: (conv.platform as Platform) || "instagram",
        avatarUrl: conv.contacts?.avatar_url,
      });"""

new_active_toast = """      if (!isToastsMuted) {
        setActiveToast({
          id: `toast-${Date.now()}`,
          conversationId: conv.id,
          senderName,
          preview,
          platform: (conv.platform as Platform) || "instagram",
          avatarUrl: conv.contacts?.avatar_url,
        });
      }"""

text = text.replace(old_active_toast, new_active_toast)

with open("components/providers/global-live-sync-provider.tsx", "w") as f:
    f.write(text)

