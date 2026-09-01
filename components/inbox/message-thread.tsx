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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadAttachment } from "@/lib/storage";
import { useInboxStore } from "@/lib/stores/inbox-store";
import { useConversationMessages, useUpdateConversationStatus, useDeleteConversation } from "@/lib/hooks/use-inbox-queries";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/platform-icon";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import type { Database, ConversationStatus, Platform } from "@/lib/types/database";

type Message = Database["public"]["Tables"]["messages"]["Row"] & { is_internal?: boolean };
type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
};

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
  previous: Message | undefined
): boolean {
  if (!previous) return true;
  const currentDate = new Date(current.created_at).toDateString();
  const previousDate = new Date(previous.created_at).toDateString();
  return currentDate !== previousDate;
}

function MessageBubble({
  message,
  onRetry,
  contactName,
  avatarUrl,
  platform,
}: {
  message: Message;
  onRetry?: (msg: Message) => void;
  contactName?: string | null;
  avatarUrl?: string | null;
  platform?: Platform | null;
}) {
  const isInbound = message.direction === "inbound";
  const isBot = message.sent_by_flow_id !== null;

  return (
    <div
      className={cn(
        "flex gap-2.5 group transition-all",
        isInbound ? "justify-start" : "justify-end"
      )}
    >
      {isInbound && (
        <Avatar
          src={avatarUrl}
          name={contactName}
          size="xs"
          className="mt-0.5"
        />
      )}

      <div className="max-w-[75%] sm:max-w-[70%] flex flex-col">
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm shadow-xs transition-shadow",
            isInbound
              ? "rounded-tl-xs bg-muted text-foreground border border-border/40"
              : message.is_internal 
                ? "rounded-tr-xs bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/30"
                : "rounded-tr-xs bg-primary text-primary-foreground shadow-sm shadow-primary/20"
          )}
        >
          {message.is_internal && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">
              <span>INTERNAL NOTE</span>
            </div>
          )}

          {message.text && (
            <p className="whitespace-pre-wrap leading-relaxed break-words">
              {typeof message.text === "string" ? message.text : JSON.stringify(message.text)}
            </p>
          )}

          {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {message.attachments.filter(Boolean).map((att: any, i: number) => {
                const url = att.url || att.payload?.url;
                if (!url) return null;
                
                if (att.type === "image") {
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block max-w-[280px] overflow-hidden rounded-xl border border-border/50 hover:opacity-90 transition-opacity">
                      <img src={url} alt="Attachment" className="h-auto w-full object-cover max-h-[300px]" loading="lazy" />
                    </a>
                  );
                } else if (att.type === "video" || att.type === "reel") {
                  return (
                    <div key={i} className="max-w-[280px] overflow-hidden rounded-xl border border-border/50 bg-black">
                      <video src={url} controls className="h-auto w-full max-h-[280px]" preload="metadata" />
                    </div>
                  );
                } else if (att.type === "audio" || att.type === "voice") {
                  return (
                    <div key={i} className="min-w-[220px] max-w-[280px] overflow-hidden rounded-xl border border-border/50 bg-background/60 p-2 backdrop-blur-xs">
                      <audio src={url} controls className="w-full h-8" preload="metadata" />
                    </div>
                  );
                } else {
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-background/50 px-3 py-2 text-xs hover:bg-background/80 transition-colors border border-border/40">
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium">{att.name || "Attachment"}</span>
                    </a>
                  );
                }
              })}
            </div>
          )}
        </div>

        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10px] text-muted-foreground px-1",
            isInbound ? "justify-start" : "justify-end"
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
              {message.status === "pending" && <Clock className="h-3 w-3 animate-spin" />}
              {message.delivery_status === "sent" && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
              {message.delivery_status === "delivered" && <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />}
              {message.delivery_status === "read" && <CheckCheck className="h-3.5 w-3.5 text-blue-500" />}
              {message.status === "failed" && (
                <div className="flex items-center gap-1 text-red-500 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  <span>Failed</span>
                  {onRetry && (
                    <button onClick={() => onRetry(message)} className="ml-1 underline font-bold">
                      Retry
                    </button>
                  )}
                </div>
              )}
            </span>
          )}
        </div>
      </div>

      {!isInbound && !isBot && (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold mt-0.5">
          You
        </div>
      )}
      {!isInbound && isBot && (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mt-0.5">
          <Bot className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}

export function MessageThread({
  conversation,
  messages: initialMessages,
}: {
  conversation: Conversation | null;
  messages: Message[];
}) {
  const router = useRouter();

  // ── TanStack Query + Zustand fallback ────────────────────────────
  const { data: queryMessages } = useConversationMessages(conversation?.id ?? null);
  const updateStatusMutation = useUpdateConversationStatus();
  const deleteConversationMutation = useDeleteConversation();

  const storeMessages = useInboxStore(
    (s) =>
      conversation?.id
        ? s.messagesByConversation[conversation.id] ?? []
        : []
  );
  const sendMessageToStore = useInboxStore((s) => s.sendMessage);
  const confirmMessage = useInboxStore((s) => s.confirmMessage);
  const failMessage = useInboxStore((s) => s.failMessage);
  const removeConversationFromStore = useInboxStore((s) => s.removeConversation);

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
  const [assigning, setAssigning] = useState(false);
  const [members, setMembers] = useState<{user_id: string, users: {full_name: string | null}}[]>([]);
  
  const [attachments, setAttachments] = useState<{url: string, type: string, name: string, path?: string, isVoiceNote?: boolean}[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Voice recording state & microphone modal
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micPermissionError, setMicPermissionError] = useState(false);
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

  // Fetch team members for assignment
  useEffect(() => {
    if (!conversation?.workspace_id) return;
    async function loadMembers() {
      const supabase = createClient();
      const { data } = await supabase
        .from("workspace_members")
        .select("user_id, users:user_id(full_name)")
        .eq("workspace_id", conversation!.workspace_id);
      if (data) {
        setMembers(data as any);
      }
    }
    loadMembers();
  }, [conversation?.workspace_id]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !conversation?.workspace_id) return;
    
    setUploadingFiles(true);
    try {
      const newAttachments: {url: string, type: string, name: string, path?: string}[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const { url, path } = await uploadAttachment(conversation.workspace_id, conversation.id, file);
        newAttachments.push({
          url,
          path,
          type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document",
          name: file.name
        });
      }
      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (err) {
      alert("Failed to upload attachment: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    setMicPermissionError(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicPermissionError(true);
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const options = MediaRecorder.isTypeSupported("audio/webm") ? { mimeType: "audio/webm" } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const extension = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
        
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());
        
        let finalBlob = audioBlob;
        let finalExtension = extension;
        let finalMimeType = mimeType;
        let isVoiceNote = false;

        // WhatsApp strictly requires .ogg OPUS. Transcode if FFmpeg is ready!
        if (ffmpegLoaded && ffmpegRef.current && conversation?.platform === "whatsapp") {
          try {
            const ffmpeg = ffmpegRef.current;
            const inputName = `input.${extension}`;
            const outputName = `output.ogg`;
            
            await ffmpeg.writeFile(inputName, await fetchFile(audioBlob));
            await ffmpeg.exec(['-i', inputName, '-c:a', 'libopus', '-ac', '1', outputName]);
            
            const data = await ffmpeg.readFile(outputName);
            finalBlob = new Blob([data as any], { type: "audio/ogg" });
            finalExtension = "ogg";
            finalMimeType = "audio/ogg";
            isVoiceNote = true;
          } catch (transcodeErr) {
            console.error("FFmpeg transcode failed, falling back to raw audio", transcodeErr);
          }
        }
        
        const file = new File([finalBlob], `voice_note_${Date.now()}.${finalExtension}`, { type: finalMimeType });
        
        setUploadingFiles(true);
        try {
          if (!conversation?.workspace_id) throw new Error("Missing workspace");
          const { url, path } = await uploadAttachment(conversation.workspace_id, conversation.id, file);
          setAttachments((prev) => [
            ...prev,
            { url, path, type: "audio", name: "Voice Note", isVoiceNote }
          ]);
        } catch (err) {
          alert("Failed to upload voice note: " + (err instanceof Error ? err.message : String(err)));
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
      // Display clear, instructive modal instead of generic alert
      setMicPermissionError(true);
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
    [conversation, updateStatusMutation]
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
      alert("Failed to delete conversation: " + (err instanceof Error ? err.message : String(err)));
    }
  }, [conversation, deleteConversationMutation, removeConversationFromStore, router]);

  const updateAssignee = useCallback(
    async (userId: string | null) => {
      if (!conversation || assigning) return;
      setAssigning(true);
      try {
        const res = await fetch(`/api/v1/conversations/${conversation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assigned_to: userId || null }),
        });
        if (!res.ok) throw new Error("Failed to assign");
      } catch {
        alert("Failed to assign conversation");
      } finally {
        setAssigning(false);
      }
    },
    [conversation, assigning]
  );

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, []);

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
    if ((!input.trim() && attachments.length === 0) || !conversation || sending || uploadingFiles) return;

    const text = input.trim();
    setInput("");
    const attachmentsToSend = [...attachments];
    setAttachments([]);
    setSending(true);

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      workspace_id: conversation.workspace_id,
      conversation_id: conversation.id,
      direction: "outbound",
      text,
      attachments: attachmentsToSend.length > 0 ? attachmentsToSend : null,
      quick_reply_payload: null,
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
        body: JSON.stringify({ conversationId: conversation.id, text, isInternal, attachments: attachmentsToSend }),
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
      <div className="flex h-full flex-col items-center justify-center bg-background text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Select a conversation
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          Choose a chat from the list to view messages and interact with your customer
        </p>
      </div>
    );
  }

  const contactName = conversation.contacts?.display_name || "Customer";

  return (
    <div className="flex h-full flex-col bg-background relative">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 bg-background/90 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            src={conversation.contacts?.avatar_url}
            name={contactName}
            platform={conversation.platform as Platform}
            size="sm"
          />
          <div className="min-w-0 flex flex-col">
            <p className="text-sm font-bold text-foreground truncate">
              {contactName}
            </p>
            <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {conversation.platform} • {conversation.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Assignee select */}
          <select
            value={conversation.assigned_to || ""}
            onChange={(e) => updateAssignee(e.target.value)}
            disabled={assigning}
            className="hidden sm:block h-7 w-28 rounded-md border border-input bg-background/50 px-2 text-xs text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}>{m.users.full_name}</option>
            ))}
          </select>

          {/* Status quick toggle */}
          {conversation.status === "open" ? (
            <button
              onClick={() => updateConversationStatus("closed")}
              title="Close chat"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Close</span>
            </button>
          ) : (
            <button
              onClick={() => updateConversationStatus("open")}
              title="Reopen chat"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reopen</span>
            </button>
          )}

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Chat Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl border border-border bg-card p-1 shadow-lg z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => updateConversationStatus(conversation.status === "open" ? "closed" : "open")}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-muted transition-colors"
                >
                  {conversation.status === "open" ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
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
                  onClick={() => updateConversationStatus("snoozed")}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-muted transition-colors"
                >
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Snooze Chat</span>
                </button>

                <button
                  onClick={() => updateConversationStatus("archived")}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-muted transition-colors"
                >
                  <Archive className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Archive Chat</span>
                </button>

                <div className="my-1 border-t border-border/60" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteConfirmOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-rose-600 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((message, i) => (
            <div key={message.id}>
              {shouldShowDateSeparator(message, messages[i - 1]) && (
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-[11px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                    {formatDateSeparator(message.created_at)}
                  </span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
              )}
              <MessageBubble
                message={message}
                onRetry={handleRetry}
                contactName={contactName}
                avatarUrl={conversation.contacts?.avatar_url}
                platform={conversation.platform as Platform}
              />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <h4 className="text-base font-bold text-foreground">Delete Conversation?</h4>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              This will permanently delete this conversation and its local message history for <strong>{contactName}</strong>.
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

      {/* Microphone Permission Modal */}
      {micPermissionError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-500 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Mic className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Microphone Access Required</h4>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your browser blocked microphone access. To record and send voice notes:
            </p>

            <ol className="mt-3 space-y-2 text-xs text-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
              <li className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">1</span>
                <span>Click the <strong>Padlock 🔒 / Site Settings</strong> icon on the left side of your browser address bar (URL).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">2</span>
                <span>Toggle <strong>Microphone</strong> to <strong>Allow</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">3</span>
                <span>Click the microphone button again to start recording!</span>
              </li>
            </ol>

            <div className="mt-5 flex justify-end">
              <Button
                size="sm"
                onClick={() => setMicPermissionError(false)}
              >
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-border bg-background/95 backdrop-blur-md p-3 sm:p-4 shrink-0">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((att, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs"
              >
                {att.type === "image" ? (
                  <ImageIcon className="h-3.5 w-3.5 text-primary" />
                ) : att.type === "audio" ? (
                  <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="max-w-[150px] truncate font-medium">{att.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="ml-1 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recording active bar */}
        {isRecording ? (
          <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm animate-pulse">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
              <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
              <span>Recording Voice Note... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelRecording}
                className="text-xs text-muted-foreground hover:text-foreground"
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
          <div className="rounded-2xl border border-input bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            {/* Mode switch (Chat vs Internal Note) */}
            <div className="flex items-center justify-between px-3 pt-2 pb-1 border-b border-border/40 text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsInternal(false)}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-semibold transition-colors",
                    !isInternal
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  Reply to Customer
                </button>
                <button
                  type="button"
                  onClick={() => setIsInternal(true)}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-semibold transition-colors",
                    isInternal
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  Internal Note (Team Only)
                </button>
              </div>
            </div>

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
                  ? "Write an internal note for your team..."
                  : `Message ${contactName}...`
              }
              rows={2}
              className="w-full resize-none bg-transparent px-4 py-2.5 text-xs focus:outline-none placeholder:text-muted-foreground/60"
            />

            {/* Bottom tools */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <div className="flex items-center gap-1">
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
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={startRecording}
                  disabled={uploadingFiles}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  title="Record voice note"
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={
                    (!input.trim() && attachments.length === 0) ||
                    sending ||
                    uploadingFiles
                  }
                  className={cn(
                    "rounded-xl px-3 text-xs font-semibold shadow-sm transition-all",
                    isInternal
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  )}
                >
                  {sending || uploadingFiles ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1" />
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
  );
}
