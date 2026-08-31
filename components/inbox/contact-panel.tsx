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
import type { Database, Platform } from "@/lib/types/database";

type TagRow = Database["public"]["Tables"]["tags"]["Row"];
type CustomFieldDef = Database["public"]["Tables"]["custom_field_definitions"]["Row"];

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
              .select("platform_username, platform_sender_id, channels(platform)")
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
              definition: cf.custom_field_definitions as unknown as CustomFieldDef,
              value: cf.value,
            }))
            .filter((cf) => cf.definition);

          const channels = (channelsRes.data ?? []).map((cc) => ({
            platform: (cc.channels as unknown as { platform: Platform })?.platform || "instagram",
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
    if (!contactId || !newFieldKey.trim() || !newFieldValue.trim() || addingField) return;
    setAddingField(true);
    try {
      const res = await fetch(`/api/v1/contacts/${contactId}/custom-fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFieldKey.trim(), value: newFieldValue.trim() }),
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
      const res = await fetch(`/api/v1/conversations/${details.conversationId}/automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAutomationPaused: nextPaused }),
      });
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
      const res = await fetch(`/api/v1/conversations/${details.conversationId}/mute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isMuted: nextMuted }),
      });
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

  const phone = (details?.contact.metadata as Record<string, any>)?.phone || null;

  return (
    <div className={cn("flex h-full flex-col border-l border-border bg-card shadow-sm select-none shrink-0", isMobile ? "w-full" : "w-84")}>
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 bg-muted/20">
        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              onClick={onClose}
              className="mr-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Contact CRM</h3>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/dashboard/contacts/${contactId}`}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Open full CRM profile"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 flex-col items-center p-5 space-y-6 bg-card">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 w-full flex flex-col items-center">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="w-full space-y-3 mt-4">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      ) : details ? (
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {/* Profile section */}
          <div className="flex flex-col items-center p-5 text-center bg-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary ring-2 ring-primary/20">
              {details.contact.avatar_url ? (
                <img
                  src={details.contact.avatar_url}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                details.contact.display_name?.[0]?.toUpperCase() ?? "?"
              )}
            </div>
            <h4 className="mt-3 font-semibold text-foreground text-sm">
              {details.contact.display_name ?? "Customer"}
            </h4>
            {details.contact.email && (
              <p className="text-xs text-muted-foreground mt-0.5">{details.contact.email}</p>
            )}
            {phone && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {phone}
              </p>
            )}

            {/* Automation takeover switch */}
            {details.conversationId && (
              <div className="mt-4 w-full">
                <button
                  onClick={handleToggleAutomation}
                  disabled={togglingAutomation}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold transition-all border",
                    details.isAutomationPaused
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                      : "bg-primary/10 border-primary/20 text-primary"
                  )}
                >
                  {togglingAutomation ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : details.isAutomationPaused ? (
                    <UserCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                  {details.isAutomationPaused ? "Human Takeover (Bot Paused)" : "Bot Automation Active"}
                </button>
              </div>
            )}

            {/* Mute conversation switch */}
            {details.conversationId && (
              <div className="mt-2 w-full">
                <button
                  onClick={handleToggleMute}
                  disabled={togglingMute}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold transition-all border",
                    details.isMuted
                      ? "bg-muted border-border text-muted-foreground"
                      : "bg-background border-border text-foreground hover:bg-muted/50"
                  )}
                >
                  {togglingMute ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : details.isMuted ? (
                    <BellOff className="h-3.5 w-3.5" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                  {details.isMuted ? "Conversation Muted" : "Mute Notifications"}
                </button>
              </div>
            )}
          </div>

          {/* Connected Channels */}
          {details.channels.length > 0 && (
            <div className="p-4 space-y-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Connected Channels
              </h5>
              <div className="space-y-1.5">
                {details.channels.map((ch, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-muted/30 rounded-lg p-2">
                    <PlatformIcon platform={ch.platform} size={14} />
                    <span className="capitalize font-medium text-foreground">{ch.platform}</span>
                    {ch.platform_username && (
                      <span className="truncate text-muted-foreground ml-auto">
                        @{ch.platform_username}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Section */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3 w-3 text-primary" />
                Tags ({details.tags.length})
              </h5>
            </div>

            {/* Tag Badges */}
            <div className="flex flex-wrap gap-1.5 min-h-[24px]">
              {details.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors bg-primary/10 border-primary/20 text-primary"
                >
                  {tag.name}
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    className="hover:text-red-500 focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {details.tags.length === 0 && (
                <span className="text-xs text-muted-foreground/60 italic">No tags assigned</span>
              )}
            </div>

            {/* Add Tag Input */}
            <form onSubmit={handleAddTag} className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="+ Add tag..."
                className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={!newTagName.trim() || addingTag}
                className="rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {addingTag ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
              </button>
            </form>
          </div>

          {/* Internal Team Notes */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-primary" />
                Internal Notes ({notes.length})
              </h5>
            </div>

            {/* Add Note Input */}
            <form onSubmit={handleAddNote} className="space-y-1.5">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Leave an internal note about this contact..."
                rows={2}
                className="w-full rounded-lg border border-input bg-background p-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteContent.trim() || addingNote}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {addingNote && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Note
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {notes.map((note) => (
                <div key={note.id} className="rounded-xl border border-border bg-muted/20 p-2.5 text-xs space-y-1 group">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground">{note.author_name || "Agent"}</span>
                    <div className="flex items-center gap-1">
                      <span>{formatDate(note.created_at)}</span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{note.content}</p>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-xs text-muted-foreground/60 italic text-center py-2">No team notes yet</p>
              )}
            </div>
          </div>

          {/* Custom Fields & Attributes */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Hash className="h-3 w-3 text-primary" />
                Custom Attributes ({details.customFields.length})
              </h5>
              <button
                type="button"
                onClick={() => setShowAddField(!showAddField)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {showAddField ? "Cancel" : "+ Add"}
              </button>
            </div>

            {showAddField && (
              <div className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-2">
                <input
                  type="text"
                  placeholder="Attribute name (e.g. city, tier)"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Cairo, VIP)"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  disabled={!newFieldKey.trim() || !newFieldValue.trim() || addingField}
                  className="w-full rounded bg-primary py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {addingField ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "Save Attribute"}
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              {details.customFields.map((cf) => (
                <div key={cf.definition.id} className="flex items-center justify-between rounded-lg bg-muted/20 p-2 text-xs">
                  <span className="text-muted-foreground font-medium">{cf.definition.name}</span>
                  <span className="font-semibold text-foreground truncate max-w-[140px]">{cf.value}</span>
                </div>
              ))}
              {details.customFields.length === 0 && !showAddField && (
                <p className="text-xs text-muted-foreground/60 italic">No custom attributes</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          Contact not found
        </div>
      )}
    </div>
  );
}
