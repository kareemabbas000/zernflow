"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Paperclip,
  Bot,
  User,
  MessageSquare,
  CheckCircle,
  Clock,
  RotateCcw,
  Loader2,
  Smile,
  Zap,
  Sparkles,
  Image as ImageIcon,
  X,
  Check,
  CheckCheck,
  AlertCircle,
  Mic,
  Archive,
  Trash2,
  MoreVertical,
  Volume2,
  Info,
  Square,
  RefreshCw,
  Reply,
  BellOff,
  BotOff,
  ChevronDown,
  UserCheck,
  UserPlus,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadAttachment } from "@/lib/storage";
import { useInboxStore } from "@/lib/stores/inbox-store";
import {
  useConversationMessages,
  useUpdateConversationStatus,
  useDeleteConversation,
} from "@/lib/hooks/use-inbox-queries";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/platform-icon";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { AttachmentRenderer } from "@/components/inbox/attachment-renderer";
import { LEAD_STAGE_OPTIONS, LEAD_STAGES } from "@/lib/crm";
import type {
  Database,
  ConversationStatus,
  Platform,
} from "@/lib/types/database";

type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  is_internal?: boolean;
};
type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
  channels?: {
    id: string;
    display_name: string | null;
    platform: string;
    username?: string | null;
    profile_picture?: string | null;
    is_active?: boolean;
  } | null;
};

const POPULAR_EMOJIS = [
  "😀",
  "😂",
  "🤣",
  "😊",
  "😍",
  "🥰",
  "😎",
  "🤩",
  "🤔",
  "🤫",
  "🙄",
  "😴",
  "😭",
  "😤",
  "😡",
  "🤯",
  "👍",
  "👎",
  "👏",
  "🙌",
  "🙏",
  "🤝",
  "💪",
  "✌️",
  "❤️",
  "🔥",
  "✨",
  "🎉",
  "💯",
  "🚀",
  "💡",
  "⭐",
  "👀",
  "🎯",
  "✅",
  "❌",
  "❓",
  "❗",
  "💬",
  "📦",
];

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function shouldShowDateSeparator(
  current: Message,
  previous: Message | undefined,
): boolean {
  if (!previous) return true;
  const currentDate = new Date(current.created_at).toDateString();
  const previousDate = new Date(previous.created_at).toDateString();
  return currentDate !== previousDate;
}

function MessageBubble({
  message,
  onRetry,
  onReply,
  contactName,
  avatarUrl,
  platform,
  isSequentialNext,
  isSequentialPrev,
}: {
  message: Message;
  onRetry?: (msg: Message) => void;
  onReply?: (msg: Message) => void;
  contactName?: string | null;
  avatarUrl?: string | null;
  platform?: Platform | null;
  isSequentialNext?: boolean;
  isSequentialPrev?: boolean;
}) {
  const isInbound = message.direction === "inbound";
  const isBot = message.sent_by_flow_id !== null;
  const replyInfo =
    (message.quick_reply_payload as any)?.reply_to ||
    (message as any).reply_to ||
    null;

  return (
    <div
      className={cn(
        "flex items-end gap-2 group transition-all relative",
        isInbound ? "justify-start" : "justify-end",
      )}
    >
      {isInbound && (
        <Avatar
          src={avatarUrl}
          name={contactName}
          size="xs"
          className="mb-1 shrink-0"
        />
      )}

      {/* Hover Reply button (appears on opposite side for inbound) */}
      {!isInbound && onReply && (
        <button
          type="button"
          onClick={() => onReply(message)}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-[var(--surface-2)] text-[var(--ink-3)] hover:text-[var(--ink)] transition-all shrink-0 mb-3 cursor-pointer shadow-sm border border-[var(--border)] bg-[var(--surface)]"
          title="Reply to this message"
        >
          <Reply className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="max-w-[85%] sm:max-w-[75%] flex flex-col">
        <div
          className={cn(
            "px-4 py-3 text-[14px] shadow-sm transition-shadow",
            isInbound
              ? `bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border)] ${isSequentialPrev ? "rounded-tl-sm mt-0.5" : "rounded-tl-2xl mt-2"} ${isSequentialNext ? "rounded-bl-sm" : "rounded-bl-2xl"} rounded-r-2xl`
              : message.is_internal
                ? `bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/30 ${isSequentialPrev ? "rounded-tr-sm mt-0.5" : "rounded-tr-2xl mt-2"} ${isSequentialNext ? "rounded-br-sm" : "rounded-br-2xl"} rounded-l-2xl`
                : `bg-[var(--brand)] text-white shadow-md shadow-[var(--brand)]/10 ${isSequentialPrev ? "rounded-tr-sm mt-0.5" : "rounded-tr-2xl mt-2"} ${isSequentialNext ? "rounded-br-sm" : "rounded-br-2xl"} rounded-l-2xl`,
          )}
        >
          {message.is_internal && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">
              <span>INTERNAL NOTE</span>
            </div>
          )}

          {/* Quoted / Replied Message Card */}
          {replyInfo && (
            <div
              className={cn(
                "mb-2.5 rounded-md border-l-3 px-3 py-1.5 text-xs select-none",
                isInbound
                  ? "border-primary bg-[var(--paper)]/60 text-[var(--ink)]"
                  : "border-primary-foreground/70 bg-black/20 text-primary-foreground",
              )}
            >
              <div className="flex items-center gap-1 font-bold text-[10px] opacity-90">
                <Reply className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {replyInfo.sender_name || "Replying to"}
                </span>
              </div>
              <p className="text-[11px] opacity-80 truncate mt-0.5 font-normal">
                {replyInfo.text || "Media message"}
              </p>
            </div>
          )}

          {message.text ? (
            <p className="whitespace-pre-wrap leading-relaxed break-words">
              {typeof message.text === "string"
                ? message.text
                : JSON.stringify(message.text)}
            </p>
          ) : (
            (!message.attachments ||
              !Array.isArray(message.attachments) ||
              message.attachments.length === 0) &&
            (isInbound ? (
              (message as any).referral ? (
                <div className="flex items-center gap-1.5 text-xs text-[var(--ink-2)] font-medium py-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Started conversation from your Instagram Ad</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-[var(--ink-2)] font-medium py-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Started conversation / Sent a reaction</span>
                </div>
              )
            ) : (
              <span className="text-xs text-primary-foreground/85 font-medium">
                Sent message
              </span>
            ))
          )}

          <AttachmentRenderer
            attachments={message.attachments as any}
            platform={platform}
            isInbound={isInbound}
            isStoryMention={(message as any).isStoryMention}
            isStoryReply={(message as any).isStoryReply}
          />
        </div>

        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10px] text-[var(--ink-2)] px-1",
            isInbound ? "justify-start" : "justify-end",
          )}
        >
          {isBot && (
            <span className="flex items-center gap-0.5 text-primary font-semibold">
              <Bot className="h-3 w-3" />
              AI
            </span>
          )}
          <span>{formatMessageTime(message.created_at)}</span>
          {!isInbound && (
            <span className="ml-1 flex items-center">
              {message.status === "pending" && (
                <Clock className="h-3 w-3 animate-spin" />
              )}
              {message.delivery_status === "sent" && (
                <Check className="h-3.5 w-3.5 text-[var(--ink-2)]" />
              )}
              {message.delivery_status === "delivered" && (
                <CheckCheck className="h-3.5 w-3.5 text-[var(--ink-2)]" />
              )}
              {message.delivery_status === "read" && (
                <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
              )}
              {message.status === "failed" && (
                <div className="flex items-center gap-1 text-red-500 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  <span>Failed</span>
                  {onRetry && (
                    <button
                      onClick={() => onRetry(message)}
                      className="ml-1 underline font-bold"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Hover Reply button (appears on opposite side for outbound) */}
      {isInbound && onReply && (
        <button
          type="button"
          onClick={() => onReply(message)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] transition-all shrink-0 mb-3 cursor-pointer shadow-2xs"
          title="Reply to this message"
        >
          <Reply className="h-3.5 w-3.5" />
        </button>
      )}

      {!isInbound && !isBot && (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold mb-1">
          You
        </div>
      )}
      {!isInbound && isBot && (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mb-1">
          <Bot className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}

export function MessageThread({
  conversation,
  messages: initialMessages,
  isProfileOpen,
  onOpenProfile,
}: {
  conversation: Conversation | null;
  messages: Message[];
  isProfileOpen?: boolean;
  onOpenProfile?: () => void;
}) {
  const router = useRouter();

  // ── TanStack Query + Zustand fallback ────────────────────────────
  const { data: queryMessages } = useConversationMessages(
    conversation?.id ?? null,
  );
  const updateStatusMutation = useUpdateConversationStatus();
  const deleteConversationMutation = useDeleteConversation();

  const storeMessages = useInboxStore((s) =>
    conversation?.id ? (s.messagesByConversation[conversation.id] ?? []) : [],
  );
  const sendMessageToStore = useInboxStore((s) => s.sendMessage);
  const confirmMessage = useInboxStore((s) => s.confirmMessage);
  const failMessage = useInboxStore((s) => s.failMessage);
  const upsertConversation = useInboxStore((s) => s.upsertConversation);
  const removeConversationFromStore = useInboxStore(
    (s) => s.removeConversation,
  );

  // Combine query and store messages for instant reactivity
  const messages =
    queryMessages && queryMessages.length > 0
      ? queryMessages
      : storeMessages.length > 0
        ? storeMessages
        : initialMessages;

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [members, setMembers] = useState<
    {
      userId: string;
      name: string;
      email: string;
      role: string;
      avatarUrl: string | null;
    }[]
  >([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Dropdown States
  const [stageMenuOpen, setStageMenuOpen] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);

  const [attachments, setAttachments] = useState<
    {
      url: string;
      type: string;
      name: string;
      path?: string;
      isVoiceNote?: boolean;
    }[]
  >([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice recording state & microphone diagnostics
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micErrorInfo, setMicErrorInfo] = useState<{
    name: string;
    message: string;
  } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // FFmpeg for transcode
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  // Action Menu Dropdown State
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    async function initFFmpeg() {
      try {
        const ffmpeg = new FFmpeg();
        await ffmpeg.load();
        ffmpegRef.current = ffmpeg;
        setFfmpegLoaded(true);
      } catch (err) {
        console.warn("FFmpeg failed to load in browser:", err);
      }
    }
    initFFmpeg();
  }, []);

  // Fetch team members & current user for assignment
  useEffect(() => {
    if (!conversation?.workspace_id) return;
    async function loadMembers() {
      try {
        const res = await fetch(
          `/api/v1/workspaces/${conversation!.workspace_id}/members`,
        );
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (err) {
        console.warn("Failed to load workspace members:", err);
      }
    }
    loadMembers();

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    });
  }, [conversation?.workspace_id]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !e.target.files ||
      !e.target.files.length ||
      !conversation?.workspace_id
    )
      return;

    setUploadingFiles(true);
    try {
      const newAttachments: {
        url: string;
        type: string;
        name: string;
        path?: string;
      }[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const { url, path } = await uploadAttachment(
          conversation.workspace_id,
          conversation.id,
          file,
        );
        newAttachments.push({
          url,
          path,
          type: file.type.startsWith("image/")
            ? "image"
            : file.type.startsWith("video/")
              ? "video"
              : "document",
          name: file.name,
        });
      }
      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (err) {
      alert(
        "Failed to upload attachment: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, []);

  const handleInsertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(autoResize, 0);
    }
  };

  const startRecording = async () => {
    setMicErrorInfo(null);
    try {
      if (
        typeof window === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setMicErrorInfo({
          name: "NotSupportedError",
          message:
            "Media recording is not supported in this browser or over an insecure (HTTP) connection.",
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported audio mime type
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else {
          mimeType = "";
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualMime = mediaRecorder.mimeType || mimeType || "audio/webm";
        const extension = actualMime.includes("mp4")
          ? "mp4"
          : actualMime.includes("ogg")
            ? "ogg"
            : "webm";

        const audioBlob = new Blob(audioChunksRef.current, {
          type: actualMime,
        });
        stream.getTracks().forEach((track) => track.stop());

        let finalBlob = audioBlob;
        let finalExtension = extension;
        let finalMimeType = actualMime;
        let isVoiceNote = false;

        // WhatsApp strictly requires .ogg OPUS. Transcode if FFmpeg is ready!
        if (
          ffmpegLoaded &&
          ffmpegRef.current &&
          conversation?.platform === "whatsapp"
        ) {
          try {
            const ffmpeg = ffmpegRef.current;
            const inputName = `input.${extension}`;
            const outputName = `output.ogg`;

            await ffmpeg.writeFile(inputName, await fetchFile(audioBlob));
            await ffmpeg.exec([
              "-i",
              inputName,
              "-c:a",
              "libopus",
              "-ac",
              "1",
              outputName,
            ]);

            const data = await ffmpeg.readFile(outputName);
            finalBlob = new Blob([data as any], { type: "audio/ogg" });
            finalExtension = "ogg";
            finalMimeType = "audio/ogg";
            isVoiceNote = true;
          } catch (transcodeErr) {
            console.error(
              "FFmpeg transcode failed, falling back to raw audio",
              transcodeErr,
            );
          }
        }

        const file = new File(
          [finalBlob],
          `voice_note_${Date.now()}.${finalExtension}`,
          { type: finalMimeType },
        );

        setUploadingFiles(true);
        try {
          if (!conversation?.workspace_id) throw new Error("Missing workspace");
          const { url, path } = await uploadAttachment(
            conversation.workspace_id,
            conversation.id,
            file,
          );
          setAttachments((prev) => [
            ...prev,
            { url, path, type: "audio", name: "Voice Note", isVoiceNote },
          ]);
        } catch (err) {
          alert(
            "Failed to upload voice note: " +
              (err instanceof Error ? err.message : String(err)),
          );
        } finally {
          setUploadingFiles(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      setMicErrorInfo({
        name: err.name || "AccessError",
        message: err.message || "Failed to access microphone hardware.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      audioChunksRef.current = [];
    }
  };

  const updateConversationStatus = useCallback(
    async (status: string) => {
      if (!conversation) return;
      try {
        await updateStatusMutation.mutateAsync({
          conversationId: conversation.id,
          status,
        });
        setMenuOpen(false);
      } catch {
        alert("Failed to update status");
      }
    },
    [conversation, updateStatusMutation],
  );

  const handleDeleteConversation = useCallback(async () => {
    if (!conversation) return;
    try {
      await deleteConversationMutation.mutateAsync(conversation.id);
      removeConversationFromStore(conversation.id);
      setDeleteConfirmOpen(false);
      setMenuOpen(false);
      router.push("/dashboard/inbox");
    } catch (err) {
      alert(
        "Failed to delete conversation: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }, [
    conversation,
    deleteConversationMutation,
    removeConversationFromStore,
    router,
  ]);

  const updateAssignee = useCallback(
    async (userId: string | null) => {
      if (!conversation || assigning) return;
      setAssigning(true);
      setAssigneeMenuOpen(false);

      // Optimistic update in inbox store
      upsertConversation({
        ...conversation,
        assigned_to: userId || null,
      });

      try {
        const res = await fetch(
          `/api/v1/conversations/${conversation.id}/assign`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignedTo: userId || null }),
          },
        );
        if (!res.ok) throw new Error("Failed to assign");
      } catch (err) {
        console.error("Failed to assign conversation:", err);
      } finally {
        setAssigning(false);
      }
    },
    [conversation, assigning, upsertConversation],
  );

  const toggleMute = useCallback(async () => {
    if (!conversation) return;
    const nextMuted = !conversation.is_muted;
    upsertConversation({ ...conversation, is_muted: nextMuted });
    setMenuOpen(false);
    try {
      await fetch(`/api/v1/conversations/${conversation.id}/mute`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_muted: nextMuted }),
      });
    } catch (err) {
      console.error("Failed to toggle mute:", err);
    }
  }, [conversation, upsertConversation]);

  const toggleAutomation = useCallback(async () => {
    if (!conversation) return;
    const nextPaused = !conversation.is_automation_paused;
    upsertConversation({ ...conversation, is_automation_paused: nextPaused });
    setMenuOpen(false);
    try {
      await fetch(`/api/v1/conversations/${conversation.id}/automation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_automation_paused: nextPaused }),
      });
    } catch (err) {
      console.error("Failed to toggle automation:", err);
    }
  }, [conversation, upsertConversation]);

  const updateLeadStage = useCallback(
    async (stage: string) => {
      if (!conversation?.contact_id || updatingStage) return;
      setUpdatingStage(true);

      // Optimistic update in inbox store
      if (conversation.contacts) {
        upsertConversation({
          ...conversation,
          contacts: {
            ...conversation.contacts,
            lead_stage: stage,
          },
        });
      }

      try {
        const res = await fetch(
          `/api/v1/contacts/${conversation.contact_id}/lead-stage`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leadStage: stage }),
          },
        );
        if (!res.ok) throw new Error("Failed to update lead stage");
      } catch (err) {
        console.error("Failed to update lead stage:", err);
      } finally {
        setUpdatingStage(false);
      }
    },
    [conversation, updatingStage, upsertConversation],
  );

  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    };

    scrollToBottom("instant");

    const observer = new ResizeObserver(() => {
      if (!userScrolled) {
        scrollToBottom("smooth");
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [conversation?.id, messages.length, userScrolled]);

  async function handleSend() {
    if (
      (!input.trim() && attachments.length === 0) ||
      !conversation ||
      sending ||
      uploadingFiles
    )
      return;

    const text = input.trim();
    setInput("");
    const attachmentsToSend = [...attachments];
    setAttachments([]);
    const currentReply = replyingTo;
    setReplyingTo(null);
    setSending(true);

    const replyPayload = currentReply
      ? {
          id: currentReply.id,
          text:
            currentReply.text ||
            ((currentReply.attachments as any[])?.length
              ? "Attached media"
              : "Message"),
          sender_name:
            currentReply.direction === "inbound" ? contactName : "You",
        }
      : null;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      workspace_id: conversation.workspace_id,
      conversation_id: conversation.id,
      direction: "outbound",
      text,
      attachments: attachmentsToSend.length > 0 ? attachmentsToSend : null,
      quick_reply_payload: replyPayload
        ? ({ reply_to: replyPayload } as any)
        : null,
      postback_payload: null,
      callback_data: null,
      platform_message_id: null,
      sent_by_flow_id: null,
      sent_by_node_id: null,
      sent_by_user_id: null,
      status: "pending",
      delivery_status: "sent",
      is_internal: isInternal,
      created_at: new Date().toISOString(),
    };
    sendMessageToStore(conversation.id, optimisticMessage);

    try {
      const res = await fetch("/api/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          text,
          isInternal,
          attachments: attachmentsToSend,
          replyTo: replyPayload,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Send failed (${res.status})`);
      }

      const confirmedMessage: Message = await res.json();
      confirmMessage(conversation.id, optimisticId, confirmedMessage);
    } catch (err) {
      console.error("Failed to send message:", err);
      failMessage(conversation.id, optimisticId);
    } finally {
      setSending(false);
    }
  }

  const handleRetry = async (failedMsg: Message) => {
    if (!conversation) return;
    const newOptimisticId = `optimistic-${Date.now()}`;
    confirmMessage(conversation.id, failedMsg.id, {
      ...failedMsg,
      id: newOptimisticId,
      status: "pending",
    });

    try {
      const res = await fetch("/api/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          text: failedMsg.text,
          isInternal: failedMsg.is_internal,
          attachments: failedMsg.attachments,
        }),
      });

      if (!res.ok) throw new Error("Retry failed");
      const confirmedMessage: Message = await res.json();
      confirmMessage(conversation.id, newOptimisticId, confirmedMessage);
    } catch (err) {
      failMessage(conversation.id, newOptimisticId);
    }
  };

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[var(--paper)] text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[var(--surface)]/60 mb-4">
          <MessageSquare className="h-8 w-8 text-[var(--ink-2)]/40" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--ink)]">
          Select a conversation
        </h3>
        <p className="mt-1 text-xs text-[var(--ink-2)] max-w-xs">
          Choose a chat from the list to view messages and interact with your
          customer
        </p>
      </div>
    );
  }

  const contactName = conversation.contacts?.display_name || "Customer";

  return (
    <div className="flex h-full flex-col bg-[var(--paper)] relative">
      {/* Header */}
      <div className="flex h-13 sm:h-14 items-center justify-between border-b border-[var(--border)] px-3 sm:px-4 bg-[var(--paper)]/90 backdrop-blur-md shrink-0 z-10 gap-2">
        {/* Left: Contact Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Avatar
            src={conversation.contacts?.avatar_url}
            name={contactName}
            platform={conversation.platform as Platform}
            size="sm"
          />
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[var(--ink)] truncate max-w-[120px] sm:max-w-[200px] md:max-w-[280px]">
                {contactName}
              </p>
              {conversation.channels?.display_name && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[9.5px] font-bold text-primary shrink-0"
                  title={`Via channel: ${conversation.channels.display_name}${conversation.channels.username ? ` (@${conversation.channels.username})` : ""}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="truncate max-w-[90px] sm:max-w-[140px]">
                    {conversation.channels.display_name}
                  </span>
                </span>
              )}
            </div>
            <div className="text-[10px] sm:text-[11px] text-[var(--ink-2)] capitalize flex items-center gap-1.5 truncate">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{conversation.platform}</span>
              <span className="text-[var(--ink-2)]/40">•</span>
              <span className="text-[var(--ink-2)]/80">
                {conversation.status}
              </span>
              {conversation.is_muted && (
                <span
                  title="Conversation Muted"
                  className="inline-flex items-center text-amber-500 ml-0.5"
                >
                  <BellOff className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </span>
              )}
              {conversation.is_automation_paused && (
                <span
                  title="AI Automation Paused"
                  className="inline-flex items-center text-rose-500 ml-0.5"
                >
                  <BotOff className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* CRM Lead Stage Custom Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStageMenuOpen(!stageMenuOpen);
                setAssigneeMenuOpen(false);
                setMenuOpen(false);
              }}
              disabled={updatingStage}
              className={cn(
                "flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer shadow-2xs",
                LEAD_STAGES[conversation.contacts?.lead_stage || "lead"]
                  ?.badgeClass ||
                  "bg-[var(--surface)]/60 text-[var(--ink-2)] border-[var(--border)]",
              )}
              title="CRM Lead Stage"
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  LEAD_STAGES[conversation.contacts?.lead_stage || "lead"]?.dot,
                )}
              />
              <span className="capitalize">
                {LEAD_STAGES[conversation.contacts?.lead_stage || "lead"]
                  ?.label || "Lead"}
              </span>
              <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60" />
            </button>

            {stageMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setStageMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-44 rounded-md border border-[var(--border)] bg-[var(--paper)] p-1.5 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <p className="px-2 py-1 text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider">
                    CRM Lead Stage
                  </p>
                  <div className="space-y-0.5">
                    {LEAD_STAGE_OPTIONS.map((opt) => {
                      const isCurrent =
                        (conversation.contacts?.lead_stage || "lead") ===
                        opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            updateLeadStage(opt.id);
                            setStageMenuOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer",
                            isCurrent
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-[var(--ink)] hover:bg-[var(--surface)] font-medium",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={cn("h-2 w-2 rounded-full", opt.dot)}
                            />
                            <span>{opt.label}</span>
                          </div>
                          {isCurrent && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Team Assignee Custom Popover */}
          <div className="relative">
            {(() => {
              const assignedMember = members.find(
                (m) => m.userId === conversation.assigned_to,
              );
              const isAssignedToMe =
                currentUserId && conversation.assigned_to === currentUserId;
              return (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setAssigneeMenuOpen(!assigneeMenuOpen);
                      setStageMenuOpen(false);
                      setMenuOpen(false);
                    }}
                    disabled={assigning}
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer shadow-2xs",
                      assignedMember
                        ? isAssignedToMe
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-[var(--surface)] text-[var(--ink)] border-[var(--border)]"
                        : "bg-[var(--paper)]/80 text-[var(--ink-2)] border-[var(--border)] hover:bg-[var(--surface)]",
                    )}
                    title="Assigned team member"
                  >
                    {assignedMember ? (
                      <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-primary text-[8px] sm:text-[9px] font-bold text-primary-foreground shrink-0">
                        {assignedMember.name.slice(0, 1).toUpperCase()}
                      </div>
                    ) : (
                      <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--ink-2)]" />
                    )}
                    <span className="max-w-[65px] sm:max-w-[85px] truncate">
                      {assignedMember
                        ? isAssignedToMe
                          ? "Me"
                          : assignedMember.name
                        : "Unassigned"}
                    </span>
                    <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60" />
                  </button>

                  {assigneeMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setAssigneeMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-1.5 w-52 rounded-md border border-[var(--border)] bg-[var(--paper)] p-1.5 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                        <p className="px-2 py-1 text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider">
                          Assign Conversation
                        </p>

                        {/* Quick Assign to Me */}
                        {currentUserId && (
                          <button
                            type="button"
                            onClick={() => updateAssignee(currentUserId)}
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-primary hover:bg-primary/10 transition-colors font-semibold cursor-pointer"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Assign to Me</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => updateAssignee(null)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors cursor-pointer",
                            !conversation.assigned_to
                              ? "bg-[var(--surface)] font-bold text-[var(--ink)]"
                              : "text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
                          )}
                        >
                          <span>Unassigned</span>
                          {!conversation.assigned_to && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {members.length > 0 && (
                          <>
                            <div className="my-1 border-t border-[var(--border)]" />
                            <div className="max-h-48 overflow-y-auto space-y-0.5">
                              {members.map((m) => {
                                const isSelected =
                                  conversation.assigned_to === m.userId;
                                return (
                                  <button
                                    key={m.userId}
                                    type="button"
                                    onClick={() => updateAssignee(m.userId)}
                                    className={cn(
                                      "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors cursor-pointer",
                                      isSelected
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "text-[var(--ink)] hover:bg-[var(--surface)]",
                                    )}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary shrink-0">
                                        {m.name.slice(0, 1).toUpperCase()}
                                      </div>
                                      <div className="min-w-0 flex flex-col">
                                        <span className="truncate text-xs">
                                          {m.name}
                                        </span>
                                        <span className="text-[9px] text-[var(--ink-2)] capitalize">
                                          {m.role}
                                        </span>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>

          {/* Status quick toggle */}
          {conversation.status === "open" ? (
            <button
              onClick={() => updateConversationStatus("closed")}
              title="Close chat"
              className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[var(--surface)]/60 text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-all shadow-2xs cursor-pointer"
            >
              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden md:inline">Close</span>
            </button>
          ) : (
            <button
              onClick={() => updateConversationStatus("open")}
              title="Reopen chat"
              className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden md:inline">Reopen</span>
            </button>
          )}

          {/* Contact Profile Toggle */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isProfileOpen 
                  ? "bg-primary/10 text-primary" 
                  : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)]"
              )}
              title="Contact Profile"
            >
              <Info className="h-4 w-4" />
            </button>
          )}

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              title="Chat Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-44 rounded-md border border-[var(--border)] bg-[var(--paper)] p-1 shadow-lg z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() =>
                      updateConversationStatus(
                        conversation.status === "open" ? "closed" : "open",
                      )
                    }
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-[var(--surface)] transition-colors"
                  >
                    {conversation.status === "open" ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-[var(--ink-2)]" />
                        <span>Mark as Closed</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3.5 w-3.5 text-primary" />
                        <span>Reopen Chat</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-[var(--surface)] transition-colors cursor-pointer"
                  >
                    {conversation.is_muted ? (
                      <>
                        <BellOff className="h-3.5 w-3.5 text-primary" />
                        <span>Unmute Notifications</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="h-3.5 w-3.5 text-[var(--ink-2)]" />
                        <span>Mute Notifications</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={toggleAutomation}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-[var(--surface)] transition-colors cursor-pointer"
                  >
                    {conversation.is_automation_paused ? (
                      <>
                        <Bot className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Resume AI Bot</span>
                      </>
                    ) : (
                      <>
                        <BotOff className="h-3.5 w-3.5 text-rose-500" />
                        <span>Pause AI Bot</span>
                      </>
                    )}
                  </button>

                  <div className="my-1 border-t border-[var(--border)]" />

                  <button
                    onClick={() => updateConversationStatus("snoozed")}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-[var(--surface)] transition-colors"
                  >
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Snooze Chat</span>
                  </button>

                  <button
                    onClick={() => updateConversationStatus("archived")}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-[var(--surface)] transition-colors"
                  >
                    <Archive className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Archive Chat</span>
                  </button>

                  <div className="my-1 border-t border-[var(--border)]" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteConfirmOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Chat</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-4 scroll-smooth"
      >
        <div className="flex flex-col gap-2 min-h-full justify-end mx-auto max-w-4xl space-y-0.5 px-2 md:px-6">
          {messages.map((message, i) => {
            const nextMessage = messages[i + 1];
            const prevMessage = messages[i - 1];

            const isSequentialNext =
              nextMessage &&
              nextMessage.direction === message.direction &&
              !shouldShowDateSeparator(nextMessage, message) &&
              new Date(nextMessage.created_at).getTime() -
                new Date(message.created_at).getTime() <
                60000;
            const isSequentialPrev =
              prevMessage &&
              prevMessage.direction === message.direction &&
              !shouldShowDateSeparator(message, prevMessage) &&
              new Date(message.created_at).getTime() -
                new Date(prevMessage.created_at).getTime() <
                60000;

            return (
              <div key={message.id}>
                {shouldShowDateSeparator(message, messages[i - 1]) && (
                  <div className="my-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--border)]" />
                    <span className="text-[12px] font-bold text-[var(--ink-2)] bg-[var(--surface)]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[var(--border)]/50 shadow-sm">
                      {formatDateSeparator(message.created_at)}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--border)]" />
                  </div>
                )}
                <MessageBubble
                  message={message}
                  onRetry={handleRetry}
                  onReply={setReplyingTo}
                  contactName={contactName}
                  avatarUrl={conversation.contacts?.avatar_url}
                  platform={conversation.platform as Platform}
                  isSequentialNext={isSequentialNext}
                  isSequentialPrev={isSequentialPrev}
                />
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-md border border-[var(--border)] bg-[var(--paper)] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <h4 className="text-base font-bold text-[var(--ink)]">
              Delete Conversation?
            </h4>
            <p className="mt-2 text-xs text-[var(--ink-2)] leading-relaxed">
              This will permanently delete this conversation and its local
              message history for <strong>{contactName}</strong>.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConversation}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Microphone Permission Diagnostic Modal */}
      {micErrorInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-md border border-[var(--border)] bg-[var(--paper)] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-rose-500/10">
                <Mic className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--ink)]">
                  Microphone Access Denied
                </h4>
                <p className="text-[11px] text-[var(--ink-2)] font-mono mt-0.5">
                  Browser error: {micErrorInfo.name} ({micErrorInfo.message})
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              Google Chrome or macOS blocked access to your microphone hardware.
              Follow these two quick checks:
            </p>

            <div className="mt-4 space-y-3">
              {/* Check 1: Chrome Site Settings */}
              <div className="bg-[var(--surface)]/40 p-3.5 rounded-md border border-[var(--border)] text-xs space-y-1.5">
                <p className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                  <span>1. Check Chrome Site Settings</span>
                </p>
                <p className="text-[var(--ink-2)] text-[11px]">
                  Click the <strong>Tune / Padlock icon 🔒</strong> on the far
                  left of your address bar (URL) and ensure{" "}
                  <strong>Microphone</strong> is set to <strong>Allow</strong>.
                </p>
              </div>

              {/* Check 2: Mac System Settings */}
              <div className="bg-[var(--surface)]/40 p-3.5 rounded-md border border-[var(--border)] text-xs space-y-1.5">
                <p className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                  <span>
                    2. Check macOS System Permissions (Crucial on Mac)
                  </span>
                </p>
                <p className="text-[var(--ink-2)] text-[11px]">
                  Open Mac <strong>System Settings</strong> ➔{" "}
                  <strong>Privacy & Security</strong> ➔{" "}
                  <strong>Microphone</strong> ➔ Make sure{" "}
                  <strong>Google Chrome</strong> is toggled <strong>ON</strong>.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMicErrorInfo(null)}
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setMicErrorInfo(null);
                  startRecording();
                }}
                className="bg-[var(--brand)] text-white flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Test Microphone Again</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Composer */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)] shrink-0 z-30">
        <div className="mx-auto max-w-4xl p-3 md:p-4">
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((att, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs"
                >
                  {att.type === "image" ? (
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  ) : att.type === "audio" ? (
                    <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Paperclip className="h-3.5 w-3.5 text-[var(--ink-2)]" />
                  )}
                  <span className="max-w-[150px] truncate font-medium">
                    {att.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="ml-1 text-[var(--ink-2)] hover:text-[var(--ink)] p-0.5 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recording active bar */}
          {isRecording ? (
            <div className="flex items-center justify-between rounded-3xl border border-rose-500/40 bg-rose-500/10 px-6 py-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-3 text-[var(--danger)] font-black text-sm">
                <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping shadow-[var(--danger)]" />
                <span>
                  Recording... {Math.floor(recordingTime / 60)}:
                  {(recordingTime % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelRecording}
                  className="text-xs text-[var(--ink-2)] hover:text-[var(--ink)]"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={stopRecording}
                  className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
                >
                  <Square className="h-3.5 w-3.5 mr-1" />
                  Stop & Attach
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-[var(--border)] bg-[var(--paper)] shadow-xl focus-within:ring-4 focus-within:ring-[var(--brand)]/20 focus-within:border-[var(--brand)]/50 transition-all duration-300 relative overflow-hidden">
              {/* Mode switch (Chat vs Internal Note) */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--surface-2)]/50">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInternal(false)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                      !isInternal
                        ? "bg-[var(--brand)] text-white shadow-md shadow-[var(--brand)]/20"
                        : "text-[var(--ink-2)] hover:bg-[var(--surface)]",
                    )}
                  >
                    Customer Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInternal(true)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                      isInternal
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                        : "text-[var(--ink-2)] hover:bg-[var(--surface)]",
                    )}
                  >
                    Internal Note
                  </button>
                </div>
              </div>

              {/* Quoting / Replying Banner */}
              {replyingTo && (
                <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--brand)]/5 px-4 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Reply className="h-4 w-4 text-[var(--brand)] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[var(--brand)] truncate">
                        Replying to{" "}
                        {replyingTo.direction === "inbound"
                          ? contactName
                          : "You"}
                      </p>
                      <p className="text-[11px] font-medium text-[var(--ink-2)] truncate mt-0.5">
                        {replyingTo.text ||
                          ((replyingTo.attachments as any[])?.length
                            ? "Attached media"
                            : "Message")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="rounded-full p-1.5 text-[var(--ink-2)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] transition-colors cursor-pointer"
                    title="Cancel reply"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResize();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  isInternal
                    ? "Write an internal note for your team... (Hidden from customer)"
                    : `Type your message to ${contactName}...`
                }
                rows={1}
                className="w-full resize-none bg-transparent px-5 py-4 text-sm font-medium focus:outline-none placeholder:text-[var(--ink-3)] text-[var(--ink)] min-h-[60px] max-h-[200px] overflow-y-auto"
              />

              {/* Bottom tools */}
              <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-transparent bg-gradient-to-t from-[var(--surface-2)]/30 to-transparent">
                <div className="flex items-center gap-1.5 relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFiles}
                    className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors disabled:opacity-50"
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  {/* Emoji Picker Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={cn(
                        "p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors",
                        showEmojiPicker &&
                          "bg-[var(--surface)] text-[var(--ink)]",
                      )}
                      title="Insert emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </button>

                    {/* Emoji Popover */}
                    {showEmojiPicker && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowEmojiPicker(false)}
                        />
                        <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-md border border-[var(--border)] bg-popover p-2.5 shadow-xl animate-in slide-in-from-bottom-2 fade-in">
                          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                            {POPULAR_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleInsertEmoji(emoji)}
                                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--surface)] text-base transition-transform hover:scale-125"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={uploadingFiles}
                    className="p-2 rounded-full text-[var(--ink-2)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors disabled:opacity-50"
                    title="Record voice note"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="default"
                    onClick={handleSend}
                    disabled={
                      (!input.trim() && attachments.length === 0) ||
                      sending ||
                      uploadingFiles
                    }
                    className={cn(
                      "rounded-full px-6 shadow-xl transition-all font-bold tracking-wide active:scale-95 text-sm",
                      isInternal
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                        : "bg-gradient-to-r from-[var(--brand)] to-[var(--brand-hover)] text-white hover:opacity-90 shadow-[var(--brand)]/30 border-t border-white/20",
                    )}
                  >
                    {sending || uploadingFiles ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        <span>{isInternal ? "Save Note" : "Send"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
