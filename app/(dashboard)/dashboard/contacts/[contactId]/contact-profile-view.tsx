"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  Tag,
  Phone,
  User,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  ExternalLink,
  Bot,
  UserCheck,
  FileText,
  Clock,
  Sparkles,
  Hash,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/platform-icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Database, Platform } from "@/lib/types/database";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type TagRow = Database["public"]["Tables"]["tags"]["Row"];
type CustomFieldDef = Database["public"]["Tables"]["custom_field_definitions"]["Row"];
type Conversation = Database["public"]["Tables"]["conversations"]["Row"];

interface NoteRow {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
}

interface ChannelLink {
  id: string;
  platform_sender_id: string;
  platform_username: string | null;
  channels: {
    platform: Platform;
    username: string | null;
    display_name: string | null;
  } | null;
}

interface CustomFieldItem {
  id?: string;
  value: string;
  custom_field_definitions: CustomFieldDef | null;
}

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

export function ContactProfileView({
  contact: initialContact,
  channels: initialChannels,
  conversations: initialConversations,
  customFields: initialCustomFields,
  tags: initialTags,
  notes: initialNotes,
  workspaceId,
}: {
  contact: Contact;
  channels: ChannelLink[];
  conversations: Conversation[];
  customFields: CustomFieldItem[];
  tags: TagRow[];
  notes: NoteRow[];
  workspaceId: string;
}) {
  const router = useRouter();
  const [contact, setContact] = useState<Contact>(initialContact);
  const [tags, setTags] = useState<TagRow[]>(initialTags);
  const [notes, setNotes] = useState<NoteRow[]>(initialNotes);
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>(initialCustomFields);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "conversations" | "tags">("overview");

  // Edit Profile Modal
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(contact.display_name || "");
  const [editEmail, setEditEmail] = useState(contact.email || "");
  const [editPhone, setEditPhone] = useState(
    (contact.metadata as Record<string, any>)?.phone || ""
  );
  const [editSubscribed, setEditSubscribed] = useState(contact.is_subscribed);
  const [savingProfile, setSavingProfile] = useState(false);

  // Tag creation
  const [newTagName, setNewTagName] = useState("");
  const [addingTag, setAddingTag] = useState(false);

  // Note creation
  const [newNoteContent, setNewNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Custom Field creation
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [addingField, setAddingField] = useState(false);
  const [showAddField, setShowAddField] = useState(false);

  // Delete Contact Dialog
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Save Profile Changes
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/v1/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: editName.trim() || null,
          email: editEmail.trim() || null,
          phone: editPhone.trim() || null,
          is_subscribed: editSubscribed,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setContact(data.contact);
        setEditingProfile(false);
      }
    } catch (err) {
      console.error("Failed to update contact:", err);
    } finally {
      setSavingProfile(false);
    }
  }

  // Add Tag
  async function handleAddTag(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newTagName.trim() || addingTag) return;
    setAddingTag(true);
    try {
      const res = await fetch(`/api/v1/contacts/${contact.id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setTags(data.tags);
        setNewTagName("");
      }
    } catch (err) {
      console.error("Failed to add tag:", err);
    } finally {
      setAddingTag(false);
    }
  }

  // Remove Tag
  async function handleRemoveTag(tagId: string) {
    try {
      const res = await fetch(`/api/v1/contacts/${contact.id}/tags`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId }),
      });
      if (res.ok) {
        const data = await res.json();
        setTags(data.tags);
      }
    } catch (err) {
      console.error("Failed to remove tag:", err);
    }
  }

  // Add Note
  async function handleAddNote(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newNoteContent.trim() || addingNote) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/v1/contacts/${contact.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNoteContent.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [data.note, ...prev]);
        setNewNoteContent("");
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setAddingNote(false);
    }
  }

  // Delete Note
  async function handleDeleteNote(noteId: string) {
    try {
      const res = await fetch(`/api/v1/contacts/${contact.id}/notes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  }

  // Add Custom Field
  async function handleAddCustomField() {
    if (!newFieldKey.trim() || !newFieldValue.trim() || addingField) return;
    setAddingField(true);
    try {
      const res = await fetch(`/api/v1/contacts/${contact.id}/custom-fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFieldKey.trim(), value: newFieldValue.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setCustomFields(data.customFields || []);
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

  // Delete Contact
  async function handleDeleteContact() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/contacts/${contact.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/contacts");
      }
    } catch (err) {
      console.error("Failed to delete contact:", err);
    } finally {
      setDeleting(false);
    }
  }

  const phone = (contact.metadata as Record<string, any>)?.phone || null;
  const primaryConv = initialConversations[0];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header Bar */}
      <div className="border-b border-border bg-card/60 px-8 py-6 backdrop-blur-sm">
        <Link
          href="/dashboard/contacts"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all contacts
        </Link>

        {/* Profile Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary ring-4 ring-primary/10 shadow-sm">
              {contact.avatar_url ? (
                <img
                  src={contact.avatar_url}
                  alt={contact.display_name || "Contact"}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                contact.display_name?.[0]?.toUpperCase() ?? "?"
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {contact.display_name ?? "Unknown Customer"}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold",
                    contact.is_subscribed
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {contact.is_subscribed ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {contact.is_subscribed ? "Subscribed" : "Unsubscribed"}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {contact.email && (
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    {contact.email}
                  </span>
                )}
                {phone && (
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    {phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Active {formatDate(contact.last_interaction_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            {primaryConv ? (
              <Link
                href={`/dashboard/inbox?conversationId=${primaryConv.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                <MessageSquare className="h-4 w-4" />
                Chat in Live Inbox
              </Link>
            ) : (
              <Link
                href="/dashboard/inbox"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                <MessageSquare className="h-4 w-4" />
                Open Live Inbox
              </Link>
            )}

            <button
              onClick={() => setEditingProfile(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Profile
            </button>

            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-background px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex items-center gap-2 border-t border-border/60 pt-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
              activeTab === "overview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            Overview & Channels
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5",
              activeTab === "notes"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Team Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab("conversations")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5",
              activeTab === "conversations"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Conversations ({initialConversations.length})
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5",
              activeTab === "tags"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Tag className="h-3.5 w-3.5" />
            Tags & Attributes
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-5xl">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Connected Channels */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  Omnichannel Identifiers ({initialChannels.length})
                </h3>
                {initialChannels.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No linked channels</p>
                ) : (
                  <div className="space-y-2.5">
                    {initialChannels.map((cc) => {
                      const ch = cc.channels;
                      return (
                        <div key={cc.id} className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 p-3.5 text-xs">
                          <div className="flex items-center gap-3">
                            <PlatformIcon platform={ch?.platform || "instagram"} size={18} />
                            <div>
                              <p className="font-semibold text-foreground capitalize">
                                {ch?.display_name || ch?.username || ch?.platform || "Channel"}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {cc.platform_username ? `@${cc.platform_username}` : cc.platform_sender_id}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary capitalize">
                            {ch?.platform || "Connected"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tags & Quick Tagging */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Customer Tags ({tags.length})
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[32px]">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border bg-primary/10 border-primary/20 text-primary"
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
                  {tags.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No tags assigned</span>
                  )}
                </div>

                <form onSubmit={handleAddTag} className="flex items-center gap-2 pt-2 border-t border-border/60">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Add tag (e.g. VIP, Qualified, Lead)..."
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    disabled={!newTagName.trim() || addingTag}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {addingTag ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add Tag"}
                  </button>
                </form>
              </div>

              {/* Custom Attributes */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    Custom Attributes & Variables ({customFields.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddField(!showAddField)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {showAddField ? "Cancel" : "+ Add Custom Attribute"}
                  </button>
                </div>

                {showAddField && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border bg-muted/20 p-4">
                    <input
                      type="text"
                      placeholder="Attribute Name (e.g. city, plan)"
                      value={newFieldKey}
                      onChange={(e) => setNewFieldKey(e.target.value)}
                      className="rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. Cairo, Enterprise)"
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      className="rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      disabled={!newFieldKey.trim() || !newFieldValue.trim() || addingField}
                      className="rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      {addingField ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : "Save Attribute"}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {customFields.map((cf, i) => (
                    <div key={i} className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase">
                        {cf.custom_field_definitions?.name || "Field"}
                      </p>
                      <p className="mt-1 font-semibold text-foreground text-sm truncate">{cf.value}</p>
                    </div>
                  ))}
                  {customFields.length === 0 && !showAddField && (
                    <p className="text-xs text-muted-foreground italic py-2">No custom attributes configured for this contact.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOTES */}
          {activeTab === "notes" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Add Internal Note
                </h3>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Log customer notes, support details, meeting summaries, or special requests..."
                    rows={4}
                    className="w-full rounded-xl border border-input bg-background p-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newNoteContent.trim() || addingNote}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 shadow-sm"
                    >
                      {addingNote && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save Note
                    </button>
                  </div>
                </form>
              </div>

              {/* Notes Timeline Feed */}
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2 group">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">{note.author_name || "Support Agent"}</span>
                      <div className="flex items-center gap-2">
                        <span>{formatDate(note.created_at)}</span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-center py-12 border border-dashed rounded-2xl text-muted-foreground text-xs">
                    No notes recorded yet for this customer.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONVERSATIONS */}
          {activeTab === "conversations" && (
            <div className="space-y-4">
              {initialConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/dashboard/inbox?conversationId=${conv.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <PlatformIcon platform={conv.platform} size={22} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground capitalize group-hover:text-primary transition-colors">
                          {conv.platform} Thread
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">
                          {conv.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {conv.last_message_preview || "No message history"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDate(conv.last_message_at)}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
              {initialConversations.length === 0 && (
                <div className="text-center py-12 border border-dashed rounded-2xl text-muted-foreground text-xs">
                  No active conversations found.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TAGS */}
          {activeTab === "tags" && (
            <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-foreground">Tags & Segments Management</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Organize contacts with tags to trigger targeted broadcasts and automated flow triggers.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold border bg-primary/10 border-primary/20 text-primary"
                  >
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="hover:text-red-500 focus:outline-none"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddTag} className="flex items-center gap-2 pt-4 border-t border-border/60">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Create or apply tag..."
                  className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="submit"
                  disabled={!newTagName.trim() || addingTag}
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {addingTag ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply Tag"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Edit Contact Profile</h3>
              <button
                onClick={() => setEditingProfile(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="subscribed-chk"
                  checked={editSubscribed}
                  onChange={(e) => setEditSubscribed(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring"
                />
                <label htmlFor="subscribed-chk" className="text-xs font-medium text-foreground cursor-pointer">
                  Contact is subscribed to broadcasts and marketing campaigns
                </label>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete Contact"
        message="Are you sure you want to delete this contact and all associated records? This action cannot be undone."
        confirmLabel="Delete Contact"
        destructive={true}
        onConfirm={handleDeleteContact}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
