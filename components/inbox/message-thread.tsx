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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadAttachment } from "@/lib/storage";
import { useInboxStore } from "@/lib/stores/inbox-store";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/platform-icon";
import { Button } from "@/components/ui/button";
import type { Database, ConversationStatus } from "@/lib/types/database";

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

function MessageBubble({ message, onRetry, avatarUrl }: { message: Message; onRetry?: (msg: Message) => void; avatarUrl?: string | null }) {
  const isInbound = message.direction === "inbound";
  const isBot = message.sent_by_flow_id !== null;

  return (
    <div
      className={cn(
        "flex gap-2",
        isInbound ? "justify-start" : "justify-end"
      )}
    >
      {isInbound && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="User" className="h-full w-full object-cover" />
          ) : (
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      )}

      <div className="max-w-[70%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            isInbound
              ? "rounded-tl-md bg-muted text-foreground"
              : message.is_internal 
                ? "rounded-tr-md bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200"
                : "rounded-tr-md bg-primary text-primary-foreground"
          )}
        >
          {message.text && (
            <p className="whitespace-pre-wrap">
              {typeof message.text === "string" ? message.text : JSON.stringify(message.text)}
            </p>
          )}
          {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              {message.attachments.filter(Boolean).map((att: any, i: number) => {
                const url = att.url || att.payload?.url;
                if (!url) return null;
                
                if (att.type === "image") {
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block max-w-[200px] overflow-hidden rounded-md border border-border/50">
                      <img src={url} alt="Attachment" className="h-auto w-full object-cover" />
                    </a>
                  );
                } else if (att.type === "video" || att.type === "reel") {
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block max-w-[200px] overflow-hidden rounded-md border border-border/50 bg-black">
                      <video src={url} controls className="h-auto w-full max-h-[250px]" preload="metadata" />
                    </a>
                  );
                } else if (att.type === "audio" || att.type === "voice") {
                  return (
                    <div key={i} className="max-w-[250px] overflow-hidden rounded-md border border-border/50 bg-background/50 p-1">
                      <audio src={url} controls className="w-full h-10" preload="metadata" />
                    </div>
                  );
                } else if (att.type === "share") {
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md bg-background/50 px-2 py-1.5 text-xs hover:bg-background/80 transition-colors">
                      <Paperclip className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{att.name || "Shared Link"}</span>
                    </a>
                  );
                } else {
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md bg-background/50 px-2 py-1.5 text-xs hover:bg-background/80 transition-colors">
                      <Paperclip className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{att.name || "Attachment"}</span>
                    </a>
                  );
                }
              })}
            </div>
          )}
        </div>
        <div
          className={cn(
            "mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground",
            isInbound ? "justify-start" : "justify-end"
          )}
        >
          {isBot && <Bot className="h-3 w-3" />}
          <span>{formatMessageTime(message.created_at)}</span>
          {!isInbound && (
            <span className="ml-1 flex items-center">
              {message.status === "pending" && <Clock className="h-3 w-3" />}
              {message.delivery_status === "sent" && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
              {message.delivery_status === "delivered" && <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />}
              {message.delivery_status === "read" && <CheckCheck className="h-3.5 w-3.5 text-blue-500" />}
              {message.status === "failed" && (
                <div className="flex items-center gap-1 text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span className="text-[10px]">Failed</span>
                  {onRetry && (
                    <button onClick={() => onRetry(message)} className="ml-1 hover:underline">
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
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      {!isInbound && isBot && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-3.5 w-3.5 text-primary" />
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

  // ── Store integration ────────────────────────────────────────────
  const storeMessages = useInboxStore(
    (s) =>
      conversation?.id
        ? s.messagesByConversation[conversation.id] ?? []
        : []
  );
  const sendMessageToStore = useInboxStore((s) => s.sendMessage);
  const confirmMessage = useInboxStore((s) => s.confirmMessage);
  const failMessage = useInboxStore((s) => s.failMessage);
  const setMessages = useInboxStore((s) => s.setMessages);

  // Use store messages if available, otherwise fall back to initial
  const messages =
    storeMessages.length > 0 ? storeMessages : initialMessages;

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [members, setMembers] = useState<{user_id: string, users: {full_name: string | null}}[]>([]);
  
  const [attachments, setAttachments] = useState<{url: string, type: string, name: string, path?: string}[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
          type: file.type.startsWith("image/") ? "image" : "document",
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
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser blocked access. Ensure you are using HTTPS or localhost.");
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Safari/iOS doesn't support audio/webm, so we let the browser pick its default format
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
        // Determine the actual mime type the browser used
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
            // Convert to mono OGG Opus
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
        
        // Construct a File object from the final Blob
        const file = new File([finalBlob], `voice_note_${Date.now()}.${finalExtension}`, { type: finalMimeType });
        
        // Upload the voice note
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
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };


  // Fetch workspace members for assignment
  useEffect(() => {
    if (!conversation?.workspace_id) return;
    const fetchMembers = async () => {
      const { data } = await createClient()
        .from("workspace_members")
        .select("user_id, users(full_name)")
        .eq("workspace_id", conversation.workspace_id);
      if (data) {
        // Handle TS strictness for the join
        const typedData = data.map((d: any) => ({
           user_id: d.user_id,
           users: { full_name: d.users?.full_name || "Unknown" }
        }));
        setMembers(typedData);
      }
    };
    fetchMembers();
  }, [conversation?.workspace_id]);

  const updateAssignee = async (userId: string) => {
    if (!conversation) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/v1/conversations/${conversation.id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: userId || null }),
      });
      if (!res.ok) throw new Error("Failed to assign");
    } catch (e) {
      alert("Failed to update assignee");
    } finally {
      setAssigning(false);
    }
  };

  // Seed store from initial server-rendered messages
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  useEffect(() => {
    // Lazily load FFmpeg for Voice Notes (WhatsApp strictly requires .ogg Opus)
    const loadFFmpeg = async () => {
      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;
        await ffmpeg.load({
          coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
          wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"
        });
        setFfmpegLoaded(true);
      } catch (err) {
        console.error("Failed to load FFmpeg. Voice notes will fallback to generic audio.", err);
      }
    };
    loadFFmpeg();
  }, []);

  useEffect(() => {
    if (conversation?.id && initialMessages.length > 0) {
      setMessages(conversation.id, initialMessages);
    }
  }, [conversation?.id, initialMessages, setMessages]);

  const updateConversationStatus = useCallback(
    async (status: ConversationStatus) => {
      if (!conversation || statusUpdating) return;
      setStatusUpdating(status);
      try {
        const { error } = await createClient()
          .from("conversations")
          .update({ status })
          .eq("id", conversation.id);
        if (error) throw error;
        router.refresh();
      } catch {
        alert(`Failed to update conversation status`);
      } finally {
        setStatusUpdating(null);
      }
    },
    [conversation, statusUpdating, router]
  );

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, []);

  const lastConvIdRef = useRef<string | null>(null);

  const [userScrolled, setUserScrolled] = useState(false);

  // Auto-scroll logic using ResizeObserver to catch media loads
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    };

    // If conversation changes, reset scroll tracking and snap to bottom
    if (lastConvIdRef.current !== conversation?.id) {
      lastConvIdRef.current = conversation?.id ?? null;
      setUserScrolled(false);
      // Wait for next tick to ensure DOM is ready
      setTimeout(() => scrollToBottom("instant"), 0);
    }

    const observer = new ResizeObserver(() => {
      // If user hasn't manually scrolled up, keep pinned to bottom when size changes
      if (!userScrolled) {
        scrollToBottom("smooth");
      }
    });

    observer.observe(container);
    
    // Also observe the inner content to catch children rendering
    const innerContent = container.firstElementChild;
    if (innerContent) {
      observer.observe(innerContent);
    }

    return () => observer.disconnect();
  }, [conversation?.id, userScrolled]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    setUserScrolled(!isNearBottom);
  }, []);

  // ── No more polling! Messages arrive via Supabase Realtime → store ────

  async function handleSend() {
    if ((!input.trim() && attachments.length === 0) || !conversation || sending || uploadingFiles) return;

    const text = input.trim();
    setInput("");
    const attachmentsToSend = [...attachments];
    setAttachments([]);
    setSending(true);

    // Optimistic update via store
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
    
    // Convert back to pending state visually, though we might just create a new optimistic message
    // Since it's already in the store, we can just hit the API again.
    // Wait, the API takes `text` and `attachments`.
    
    // First remove the failed message and create a new pending one so it goes to bottom
    const newOptimisticId = `optimistic-${Date.now()}`;
    const newOptimisticMessage = { ...failedMsg, id: newOptimisticId, status: "pending" as const, created_at: new Date().toISOString() };
    
    // Use the store to remove the old and add the new
    setMessages(conversation.id, messages.filter(m => m.id !== failedMsg.id));
    sendMessageToStore(conversation.id, newOptimisticMessage);
    
    try {
      const res = await fetch("/api/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          conversationId: conversation.id, 
          text: failedMsg.text, 
          isInternal: failedMsg.is_internal, 
          attachments: failedMsg.attachments 
        }),
      });

      if (!res.ok) {
        throw new Error(`Retry failed (${res.status})`);
      }

      const confirmedMessage: Message = await res.json();
      confirmMessage(conversation.id, newOptimisticId, confirmedMessage);
    } catch (err) {
      console.error("Failed to retry message:", err);
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
          Choose a conversation from the list to view messages and reply
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {conversation.contacts?.avatar_url ? (
              <img
                src={conversation.contacts.avatar_url}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {conversation.contacts?.display_name?.[0]?.toUpperCase() ??
                  "?"}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-background">
              <PlatformIcon
                platform={conversation.platform}
                className="h-2.5 w-2.5"
                size={10}
              />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {conversation.contacts?.display_name ?? "Unknown"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={conversation.assigned_to || ""}
            onChange={(e) => updateAssignee(e.target.value)}
            disabled={assigning}
            className="h-7 w-28 md:w-32 rounded-md border border-input bg-transparent px-2 text-xs text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}>{m.users.full_name}</option>
            ))}
          </select>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
              conversation.status === "open"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : conversation.status === "snoozed"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {conversation.status}
          </span>
          {conversation.is_automation_paused && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              Bot paused
            </span>
          )}
          <div className="flex items-center gap-1">
            {conversation.status !== "closed" && (
              <button
                onClick={() => updateConversationStatus("closed")}
                disabled={!!statusUpdating}
                title="Close conversation"
                aria-label="Close conversation"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              >
                {statusUpdating === "closed" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            {conversation.status !== "snoozed" && (
              <button
                onClick={() => updateConversationStatus("snoozed")}
                disabled={!!statusUpdating}
                title="Snooze conversation"
                aria-label="Snooze conversation"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              >
                {statusUpdating === "snoozed" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            {conversation.status !== "open" && (
              <button
                onClick={() => updateConversationStatus("open")}
                disabled={!!statusUpdating}
                title="Reopen conversation"
                aria-label="Reopen conversation"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              >
                {statusUpdating === "open" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 scroll-smooth"
      >
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((message, i) => (
            <div key={message.id}>
              {shouldShowDateSeparator(message, messages[i - 1]) && (
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] text-muted-foreground">
                    {formatDateSeparator(message.created_at)}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
              <MessageBubble message={message} onRetry={handleRetry} />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background p-3 sm:p-4 shrink-0">
        <div className="mx-auto max-w-3xl rounded-xl border border-input bg-card shadow-sm focus-within:ring-1 focus-within:ring-primary/30 transition-all">
          <div className="px-3 py-2">
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((att, i) => (
                  <div key={i} className="relative flex items-center gap-2 rounded-md border border-border bg-muted/50 p-1.5 pr-2 text-xs">
                    {att.type === "image" ? (
                      <ImageIcon className="h-4 w-4 text-primary" />
                    ) : (
                      <Paperclip className="h-4 w-4 text-primary" />
                    )}
                    <span className="max-w-[120px] truncate">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(i)}
                      className="ml-1 rounded-full p-0.5 hover:bg-background transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              placeholder={isInternal ? "Type an internal note (only visible to team)..." : "Type your message..."}
              rows={1}
              className={cn("w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none", isInternal ? "text-yellow-700 dark:text-yellow-400 font-medium" : "")}
              style={{ maxHeight: 150 }}
            />
          </div>
          
          <div className="flex items-center justify-between border-t border-border/50 px-2 py-2">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsInternal(!isInternal)}
                className={cn("flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition-colors", isInternal ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" : "text-muted-foreground hover:bg-muted")}
              >
                Internal Note {isInternal ? "On" : "Off"}
              </button>
              <div className="ml-2 h-4 w-px bg-border"></div>
              
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground" 
                title="Attach file or image"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFiles}
              >
                {uploadingFiles ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              </Button>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 text-muted-foreground", showEmojiPicker && "bg-muted text-foreground")} 
                  title="Insert emoji"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                
                {showEmojiPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                    <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-border bg-popover p-2 shadow-lg animate-in slide-in-from-bottom-2 fade-in">
                      <div className="grid grid-cols-6 gap-1">
                        {["😀","😂","🥰","😎","🤔","🙄","😭","😡","👍","👎","👏","🙌","🙏","🔥","✨","🎉","❤️","💔","💯","✔️","❌","👀","😅","😊"].map(emoji => (
                          <button
                            key={emoji}
                            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-lg transition-colors"
                            onClick={() => {
                              setInput(prev => prev + emoji);
                              setShowEmojiPicker(false);
                              if (textareaRef.current) {
                                textareaRef.current.focus();
                                autoResize();
                              }
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="ml-1 flex items-center">
                {isRecording ? (
                  <div className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 dark:bg-red-900/30">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                    </span>
                    <button
                      onClick={stopRecording}
                      className="ml-1 rounded-full bg-red-200 p-0.5 text-red-700 hover:bg-red-300 dark:bg-red-800 dark:text-red-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground" 
                    title="Record voice note"
                    onClick={startRecording}
                    disabled={uploadingFiles}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
              </div>

            </div>
            
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && attachments.length === 0) || sending || uploadingFiles}
              size="sm"
              className={cn("h-8 gap-1.5 rounded-lg px-4 font-semibold shadow-none", isInternal ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "")}
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  {isInternal ? "Save Note" : "Send"} <Send className="h-3.5 w-3.5 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
