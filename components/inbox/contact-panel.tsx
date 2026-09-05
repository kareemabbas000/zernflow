"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Mail,
  Calendar,
  Tag,
  User,
  Hash,
  Bell,
  BellOff,
  ArrowLeft,
  ExternalLink,
  Plus,
  Loader2,
  Trash2,
  Check,
  Bot,
  UserCheck,
  Phone,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/platform-icon";
import { useContactsStore } from "@/lib/stores/contacts-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import type { Database, Platform } from "@/lib/types/database";

type TagRow = Database["public"]["Tables"]["tags"]["Row"];
type CustomFieldDef =
  Database["public"]["Tables"]["custom_field_definitions"]["Row"];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ContactPanel({
  contactId,
  workspaceId,
  onClose,
  isMobile = false,
}: {
  contactId: string | null;
  workspaceId: string;
  onClose: () => void;
  isMobile?: boolean;
}) {
  const {
    activeContactDetails: details,
    activeContactNotes: notes,
    isLoadingDetails: loading,
    setDetails,
    setNotes,
    setIsLoadingDetails,
    addOptimisticTag,
    removeOptimisticTag,
    addOptimisticNote,
    removeOptimisticNote,
    addOptimisticCustomField,
    setAutomationPaused,
  } = useContactsStore();

  // Editing state
  const [newTagName, setNewTagName] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [togglingAutomation, setTogglingAutomation] = useState(false);
  const [togglingMute, setTogglingMute] = useState(false);

  // Field editing
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [addingField, setAddingField] = useState(false);
  const [showAddField, setShowAddField] = useState(false);

  useEffect(() => {
    if (!contactId) return;

    async function loadContactData() {
      setIsLoadingDetails(true);
      const supabase = createClient();

      try {
        const [contactRes, tagsRes, fieldsRes, channelsRes, convRes, notesRes] =
          await Promise.all([
            supabase.from("contacts").select("*").eq("id", contactId!).single(),
            supabase
              .from("contact_tags")
              .select("tag_id, tags(*)")
              .eq("contact_id", contactId!),
            supabase
              .from("contact_custom_fields")
              .select("*, custom_field_definitions(*)")
              .eq("contact_id", contactId!),
            supabase
              .from("contact_channels")
              .select(
                "platform_username, platform_sender_id, channels(platform)",
              )
              .eq("contact_id", contactId!),
            supabase
              .from("conversations")
              .select("id, is_automation_paused, is_muted")
              .eq("contact_id", contactId!)
              .eq("workspace_id", workspaceId)
              .order("last_message_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
            fetch(`/api/v1/contacts/${contactId}/notes`)
              .then((r) => (r.ok ? r.json() : { notes: [] }))
              .catch(() => ({ notes: [] })),
          ]);

        if (contactRes.data) {
          const tags = (tagsRes.data ?? [])
            .map((ct) => ct.tags)
            .filter(Boolean) as TagRow[];

          const customFields = (fieldsRes.data ?? [])
            .map((cf) => ({
              definition:
                cf.custom_field_definitions as unknown as CustomFieldDef,
              value: cf.value,
            }))
            .filter((cf) => cf.definition);

          const channels = (channelsRes.data ?? []).map((cc) => ({
            platform:
              (cc.channels as unknown as { platform: Platform })?.platform ||
              "instagram",
            platform_username: cc.platform_username,
            platform_sender_id: cc.platform_sender_id,
          }));

          setDetails({
            contact: contactRes.data,
            tags,
            customFields,
            channels,
            conversationId: convRes.data?.id,
            isAutomationPaused: convRes.data?.is_automation_paused || false,
            isMuted: convRes.data?.is_muted || false,
          });

          setNotes(notesRes.notes || []);
        }
      } catch (err) {
        console.error("Failed to load contact details:", err);
      } finally {
        setIsLoadingDetails(false);
      }
    }

    loadContactData();
  }, [contactId, workspaceId, setDetails, setNotes, setIsLoadingDetails]);

  // Handle Add Tag
  async function handleAddTag(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!contactId || !newTagName.trim() || addingTag) return;

    setAddingTag(true);
    try {
      const res = await fetch(`/api/v1/contacts/${contactId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setDetails(details ? { ...details, tags: data.tags } : null);
        setNewTagName("");
      }
    } catch (err) {
      console.error("Failed to add tag:", err);
    } finally {
      setAddingTag(false);
    }
  }

  // Handle Remove Tag
  async function handleRemoveTag(tagId: string) {
    if (!contactId) return;
    removeOptimisticTag(tagId);
    try {
      const res = await fetch(`/api/v1/contacts/${contactId}/tags`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId }),
      });
      if (res.ok) {
        const data = await res.json();
        setDetails(details ? { ...details, tags: data.tags } : null);
      }
    } catch (err) {
      console.error("Failed to remove tag:", err);
    }
  }

  // Handle Add Note
  async function handleAddNote(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!contactId || !newNoteContent.trim() || addingNote) return;

    setAddingNote(true);
    try {
      const res = await fetch(`/api/v1/contacts/${contactId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNoteContent.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        addOptimisticNote(data.note);
        setNewNoteContent("");
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setAddingNote(false);
    }
  }

  // Handle Delete Note
  async function handleDeleteNote(noteId: string) {
    if (!contactId) return;
    removeOptimisticNote(noteId);
    try {
      const res = await fetch(`/api/v1/contacts/${contactId}/notes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      // if not ok, could rollback, but omitting for simplicity
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  }

  // Handle Add Custom Field
  async function handleAddCustomField() {
    if (
      !contactId ||
      !newFieldKey.trim() ||
      !newFieldValue.trim() ||
      addingField
    )
      return;
    setAddingField(true);
    try {
      const res = await fetch(`/api/v1/contacts/${contactId}/custom-fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFieldKey.trim(),
          value: newFieldValue.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const customFields = (data.customFields || []).map((cf: any) => ({
          definition: cf.custom_field_definitions as CustomFieldDef,
          value: cf.value,
        }));
        setDetails(details ? { ...details, customFields } : null);
        setNewFieldKey("");
        setNewFieldValue("");
        setShowAddField(false);
      }
    } catch (err) {
      console.error("Failed to add custom field:", err);
    } finally {
      setAddingField(false);
    }
  }

  // Handle Toggle Automation / Human Takeover
  async function handleToggleAutomation() {
    if (!details?.conversationId || togglingAutomation) return;
    setTogglingAutomation(true);

    // Optimistic update
    const nextPaused = !details.isAutomationPaused;
    setAutomationPaused(nextPaused);

    try {
      const res = await fetch(
        `/api/v1/conversations/${details.conversationId}/automation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAutomationPaused: nextPaused }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        setAutomationPaused(data.isAutomationPaused);
      } else {
        // Rollback
        setAutomationPaused(!nextPaused);
      }
    } catch (err) {
      console.error("Failed to toggle automation:", err);
      // Rollback
      setAutomationPaused(!nextPaused);
    } finally {
      setTogglingAutomation(false);
    }
  }

  // Handle Toggle Mute (Silent)
  async function handleToggleMute() {
    if (!details?.conversationId || togglingMute) return;
    setTogglingMute(true);

    const { setMuted } = useContactsStore.getState();
    const nextMuted = !details.isMuted;
    setMuted(nextMuted);

    try {
      const res = await fetch(
        `/api/v1/conversations/${details.conversationId}/mute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isMuted: nextMuted }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        setMuted(data.isMuted);
      } else {
        setMuted(!nextMuted);
      }
    } catch (err) {
      console.error("Failed to toggle mute:", err);
      setMuted(!nextMuted);
    } finally {
      setTogglingMute(false);
    }
  }

  if (!contactId) return null;

  const phone =
    (details?.contact.metadata as Record<string, any>)?.phone || null;

  return (
    <div
      className={cn(
        "flex h-full flex-col border-l border-[var(--border)] bg-[var(--paper)] shadow-sm select-none shrink-0",
        isMobile ? "w-full" : "w-84",
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4 bg-[var(--surface-2)]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          {isMobile && (
            <button
              onClick={onClose}
              className="mr-1 rounded-full p-2 bg-[var(--surface)] text-[var(--ink)] shadow-sm border border-[var(--border)] active:scale-95 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
            <User className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-[var(--ink)] tracking-tight">
            Intelligence
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/dashboard/contacts/${contactId}`}
            className="rounded-full p-2 bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors border border-[var(--border)] shadow-sm"
            title="Open full CRM profile"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            onClick={onClose}
            className="rounded-full p-2 bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors border border-[var(--border)] shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 flex-col items-center p-5 space-y-6 bg-[var(--paper)]">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 w-full flex flex-col items-center">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="w-full space-y-3 mt-4">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      ) : details ? (
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {/* Profile section */}
          <div className="flex flex-col items-center p-6 text-center bg-gradient-to-b from-[var(--surface-2)] to-transparent relative border-b border-[var(--border)]/40">
            <div className="relative">
              <Avatar
                src={details.contact.avatar_url}
                name={details.contact.display_name}
                size="xl"
                className="mb-3 ring-4 ring-[var(--paper)] shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-[var(--brand)] border-2 border-[var(--paper)] shadow-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>

            <h4 className="mt-4 font-black text-[var(--ink)] text-xl tracking-tight">
              {details.contact.display_name ?? "Customer"}
            </h4>

            {details.contact.email && (
              <p className="text-sm font-medium text-[var(--ink-2)] mt-1 bg-[var(--surface)] px-3 py-1 rounded-full shadow-sm border border-[var(--border)] inline-flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[var(--ink-3)]" />
                {details.contact.email}
              </p>
            )}
            {phone && (
              <p className="text-sm font-medium text-[var(--ink-2)] mt-2 bg-[var(--surface)] px-3 py-1 rounded-full shadow-sm border border-[var(--border)] inline-flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[var(--ink-3)]" />
                {phone}
              </p>
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              {/* Automation takeover switch */}
              {details.conversationId && (
                <button
                  onClick={handleToggleAutomation}
                  disabled={togglingAutomation}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-[11px] font-bold transition-all border shadow-sm",
                    details.isAutomationPaused
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                      : "bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] hover:border-[var(--brand)] hover:shadow-md",
                  )}
                >
                  {togglingAutomation ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : details.isAutomationPaused ? (
                    <UserCheck className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5 text-[var(--brand)]" />
                  )}
                  {details.isAutomationPaused ? "Human Takeover" : "Bot Active"}
                </button>
              )}

              {/* Mute conversation switch */}
              {details.conversationId && (
                <button
                  onClick={handleToggleMute}
                  disabled={togglingMute}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-[11px] font-bold transition-all border shadow-sm",
                    details.isMuted
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                      : "bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] hover:border-[var(--brand)] hover:shadow-md",
                  )}
                >
                  {togglingMute ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : details.isMuted ? (
                    <BellOff className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5 text-[var(--brand)]" />
                  )}
                  {details.isMuted ? "Muted" : "Notifications"}
                </button>
              )}
            </div>
          </div>

          {/* Connected Channels */}
          {details.channels.length > 0 && (
            <div className="p-5 space-y-3">
              <h5 className="text-[11px] font-black uppercase tracking-wider text-[var(--ink-3)] ml-1">
                Connected Channels
              </h5>
              <div className="space-y-2">
                {details.channels.map((ch, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm bg-[var(--surface)] border border-[var(--border)] shadow-sm rounded-xl p-3"
                  >
                    <PlatformIcon platform={ch.platform} size={18} />
                    <span className="capitalize font-bold text-[var(--ink)]">
                      {ch.platform}
                    </span>
                    {ch.platform_username && (
                      <span className="truncate text-[var(--ink-2)] ml-auto font-medium">
                        @{ch.platform_username}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Section */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-black uppercase tracking-wider text-[var(--ink-3)] flex items-center gap-1.5 ml-1">
                <Tag className="h-3.5 w-3.5 text-[var(--brand)]" />
                Tags ({details.tags.length})
              </h5>
            </div>

            {/* Tag Badges */}
            <div className="flex flex-wrap gap-2 min-h-[24px]">
              {details.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border transition-colors bg-[var(--brand)]/10 border-[var(--brand)]/20 text-[var(--brand)] shadow-sm"
                >
                  {tag.name}
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    className="hover:text-red-500 focus:outline-none p-0.5 rounded-full hover:bg-red-500/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {details.tags.length === 0 && (
                <span className="text-xs text-[var(--ink-3)] font-medium italic px-1">
                  No tags assigned
                </span>
              )}
            </div>

            {/* Add Tag Input */}
            <form
              onSubmit={handleAddTag}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="+ Add tag..."
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium placeholder:text-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={!newTagName.trim() || addingTag}
                className="rounded-xl bg-[var(--brand)] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[var(--brand)]/20 hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
              >
                {addingTag ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Add"
                )}
              </button>
            </form>
          </div>

          {/* Internal Team Notes */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-black uppercase tracking-wider text-[var(--ink-3)] flex items-center gap-1.5 ml-1">
                <FileText className="h-3.5 w-3.5 text-[var(--brand)]" />
                Internal Notes ({notes.length})
              </h5>
            </div>

            {/* Add Note Input */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Leave an internal note..."
                rows={2}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs font-medium placeholder:text-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 resize-none shadow-sm transition-all"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteContent.trim() || addingNote}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[var(--brand)]/20 hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {addingNote && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Save Note
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between text-[10px] text-amber-700/60 dark:text-amber-200/60 font-bold">
                    <span className="text-amber-700 dark:text-amber-300">
                      {note.author_name || "Agent"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>{formatDate(note.created_at)}</span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-1 bg-white/50 dark:bg-black/20 p-1 rounded-full"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-amber-900 dark:text-amber-100 whitespace-pre-wrap leading-relaxed font-medium">
                    {note.content}
                  </p>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-xs text-[var(--ink-3)] font-medium italic text-center py-4">
                  No team notes yet
                </p>
              )}
            </div>
          </div>

          {/* Custom Fields & Attributes */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-black uppercase tracking-wider text-[var(--ink-3)] flex items-center gap-1.5 ml-1">
                <Hash className="h-3.5 w-3.5 text-[var(--brand)]" />
                Attributes ({details.customFields.length})
              </h5>
              <button
                type="button"
                onClick={() => setShowAddField(!showAddField)}
                className="text-xs font-bold text-[var(--brand)] hover:opacity-80 transition-opacity bg-[var(--brand)]/10 px-2.5 py-1 rounded-full"
              >
                {showAddField ? "Cancel" : "+ Add"}
              </button>
            </div>

            {showAddField && (
              <div className="rounded-xl border border-[var(--brand)]/30 bg-[var(--brand)]/5 p-3 space-y-2.5 shadow-sm">
                <input
                  type="text"
                  placeholder="Attribute name (e.g. city)"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Cairo)"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30"
                />
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  disabled={
                    !newFieldKey.trim() || !newFieldValue.trim() || addingField
                  }
                  className="w-full rounded-lg bg-[var(--brand)] py-2 text-xs font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
                >
                  {addingField ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                  ) : (
                    "Save Attribute"
                  )}
                </button>
              </div>
            )}

            <div className="space-y-2">
              {details.customFields.map((cf) => (
                <div
                  key={cf.definition.id}
                  className="flex items-center justify-between rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-3 text-xs"
                >
                  <span className="text-[var(--ink-2)] font-bold">
                    {cf.definition.name}
                  </span>
                  <span className="font-bold text-[var(--ink)] truncate max-w-[140px] bg-[var(--surface-2)] px-2 py-0.5 rounded-md">
                    {cf.value}
                  </span>
                </div>
              ))}
              {details.customFields.length === 0 && !showAddField && (
                <p className="text-xs text-[var(--ink-3)] font-medium italic py-2 ml-1">
                  No custom attributes
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-xs text-[var(--ink-2)]">
          Contact not found
        </div>
      )}
    </div>
  );
}
