"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  Download,
  MoreHorizontal,
  Tags,
  Kanban,
  List,
  GripVertical,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SegmentBuilder,
  createEmptyFilter,
  type SegmentFilter,
} from "@/components/segment-builder";
import type { Database } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PlatformIcon } from "@/components/platform-icon";
import type { Platform } from "@/lib/types/database";
import { motion, AnimatePresence } from "framer-motion";

type ChannelItem = {
  id: string;
  display_name: string | null;
  platform: string;
  username?: string | null;
  profile_picture?: string | null;
  is_active?: boolean;
};

type Tag = Database["public"]["Tables"]["tags"]["Row"];
type ContactWithTags = Database["public"]["Tables"]["contacts"]["Row"] & {
  contact_tags: {
    tag_id: string;
    tags: Tag | null;
  }[];
  conversations?: {
    platform: string;
    channel_id?: string | null;
    channels?: {
      id: string;
      display_name: string | null;
      platform: string;
      username?: string | null;
      profile_picture?: string | null;
    } | null;
  }[];
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

import { ExportContactsModal } from "@/components/contacts/export-contacts-modal";
import { ImportContactsModal } from "@/components/contacts/import-contacts-modal";
import { useRouter } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function ContactsView({
  contacts,
  tags,
  channels = [],
  workspaceId,
}: {
  contacts: ContactWithTags[];
  tags: Tag[];
  channels?: ChannelItem[];
  workspaceId: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("all");
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>(
    createEmptyFilter()
  );
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  
  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [localContacts, setLocalContacts] = useState(contacts);
  useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  const handleRefreshContacts = () => {
    router.refresh();
  };

  const filtered = localContacts.filter((contact) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const name = contact.display_name?.toLowerCase() ?? "";
      const email = contact.email?.toLowerCase() ?? "";
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    // Tag filter
    if (selectedTagId) {
      const hasTag = contact.contact_tags.some(
        (ct) => ct.tag_id === selectedTagId
      );
      if (!hasTag) return false;
    }
    // Channel filter
    if (selectedChannelId !== "all") {
      const matchesChannel = contact.conversations?.some(
        (c) => c.channel_id === selectedChannelId || c.channels?.id === selectedChannelId
      );
      if (!matchesChannel) return false;
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedContacts.size === filtered.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filtered.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedContacts(newSelected);
  };

  const handleDragStart = (e: React.DragEvent, contactId: string) => {
    e.dataTransfer.setData("contactId", contactId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData("contactId");
    if (!contactId) return;

    // Optimistic update
    setLocalContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, lead_stage: stage } as any : c))
    );

    try {
      await fetch(`/api/v1/contacts/${contactId}/lead-stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadStage: stage }),
      });
    } catch (error) {
      console.error("Failed to update lead stage");
    }
  };

  const kanbanColumns = [
    { id: "lead", title: "Leads", color: "bg-blue-500" },
    { id: "negotiation", title: "Negotiation", color: "bg-amber-500" },
    { id: "won", title: "Closed Won", color: "bg-emerald-500" },
    { id: "lost", title: "Closed Lost", color: "bg-rose-500" },
  ];

  return (
    <div className="flex h-full flex-col bg-[var(--paper)] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--brand)]/5 rounded-sm blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="border-b border-[var(--border)] bg-[var(--paper)]/50 backdrop-blur-xl px-8 py-6 shrink-0 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)] flex items-center gap-2">
              <Users className="h-6 w-6 text-[var(--brand)]" />
              Contacts CRM
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-2)]">
              Manage your {contacts.length} customer relationships and AI segments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 rounded-md border border-[var(--border)] shadow-none hover:bg-[var(--surface)] transition-colors"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              className="gap-2 rounded-md shadow-none shadow-primary/20 hover:bg-[var(--brand)]/90 transition-colors"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Users className="h-4 w-4" />
              Import Contacts
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-2)]" />
              <Input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-md bg-[var(--paper)]/50 border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div className="flex bg-[var(--surface-2)] p-1 rounded-md border border-[var(--border)]">
              <button
                onClick={() => setViewMode("list")}
                className={cn("px-4 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center gap-2", viewMode === "list" ? "bg-[var(--paper)] shadow-none text-[var(--ink)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]")}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={cn("px-4 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center gap-2", viewMode === "kanban" ? "bg-[var(--paper)] shadow-none text-[var(--ink)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]")}
              >
                <Kanban className="h-4 w-4" />
                Board
              </button>
            </div>
            <Button
              variant={showSegmentBuilder ? "default" : "outline"}
              onClick={() => setShowSegmentBuilder(!showSegmentBuilder)}
              className="gap-2 h-10 rounded-md border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
            >
              <Filter className="h-4 w-4" />
              Segment
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  showSegmentBuilder && "rotate-180"
                )}
              />
            </Button>
          </div>
          
          <AnimatePresence>
            {selectedContacts.size > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--brand)] px-2 bg-[var(--brand-soft)] rounded-md py-1.5">
                  {selectedContacts.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-md"
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Segment builder dropdown */}
        <AnimatePresence>
          {showSegmentBuilder && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 p-5 rounded-md border border-[var(--border)] bg-[var(--paper)]/80 backdrop-blur-xl shadow-xl">
              <SegmentBuilder
                value={segmentFilter}
                onChange={setSegmentFilter}
                workspaceId={workspaceId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Channel Filter Pills */}
        {channels.length > 0 && (
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none]">
            <span className="text-xs font-bold text-[var(--ink-2)] mr-2 shrink-0 flex items-center gap-1.5 uppercase tracking-wider">
              Channel
            </span>
            <button
              onClick={() => setSelectedChannelId("all")}
              className={cn(
                "rounded-sm px-4 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer border shadow-none",
                selectedChannelId === "all"
                  ? "bg-foreground text-background border-foreground shadow-none"
                  : "bg-[var(--paper)]/80 text-[var(--ink-2)] border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
              )}
            >
              All Channels ({contacts.length})
            </button>
            {channels.map((ch) => {
              const isSelected = selectedChannelId === ch.id;
              const count = contacts.filter((c) =>
                c.conversations?.some((cv) => cv.channel_id === ch.id || cv.channels?.id === ch.id)
              ).length;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannelId(isSelected ? "all" : ch.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-sm px-4 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer border shadow-none",
                    isSelected
                      ? "bg-[var(--brand)] text-[var(--brand)]-foreground border-[var(--brand)] shadow-primary/20 shadow-none"
                      : "bg-[var(--paper)]/80 text-[var(--ink-2)] border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                  )}
                >
                  {ch.profile_picture ? (
                    <img
                      src={ch.profile_picture}
                      alt=""
                      className="h-4 w-4 rounded-sm object-cover shrink-0 ring-2 ring-background/20"
                    />
                  ) : (
                    <PlatformIcon platform={ch.platform as any} className="h-4 w-4 shrink-0" size={16} />
                  )}
                  <span>{ch.display_name || (ch.username ? `@${ch.username.replace(/^@/, "")}` : "Channel")}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-sm text-[10px] font-extrabold",
                      isSelected ? "bg-[var(--brand)]-foreground/20 text-[var(--brand)]-foreground" : "bg-[var(--surface)] text-[var(--ink-2)]"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tag pills */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant={selectedTagId === null ? "default" : "secondary"}
              className="cursor-pointer font-bold px-3 py-1 rounded-sm shadow-none"
              onClick={() => setSelectedTagId(null)}
            >
              All Contacts
            </Badge>
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                onClick={() =>
                  setSelectedTagId(tag.id === selectedTagId ? null : tag.id)
                }
                className={cn(
                  "cursor-pointer transition-all font-bold px-3 py-1 rounded-sm shadow-none",
                  selectedTagId === tag.id && "ring-2 ring-primary ring-offset-2 ring-offset-background border-transparent"
                )}
                style={
                  tag.color
                    ? {
                        backgroundColor: selectedTagId === tag.id ? tag.color : `${tag.color}15`,
                        color: selectedTagId === tag.id ? '#fff' : tag.color,
                        borderColor: selectedTagId === tag.id ? tag.color : `${tag.color}40`,
                      }
                    : undefined
                }
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[var(--surface-2)] p-8 relative z-10">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="h-full rounded-md border border-[var(--border)] bg-[var(--paper)] shadow-xl shadow-primary/5 overflow-hidden">
          {filtered.length === 0 ? (
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-32 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[var(--surface)]/60 mb-6 shadow-inner">
                <Users className="h-10 w-10 text-[var(--ink-2)]/50" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--ink)]">No contacts found</h3>
              <p className="mt-2 text-sm text-[var(--ink-2)] max-w-sm">
                {search || selectedTagId ? "Try adjusting your filters or search query." : "Contacts will automatically appear here when customers message you."}
              </p>
              {(search || selectedTagId) && (
                <Button 
                  variant="outline" 
                  className="mt-8 rounded-md shadow-none"
                  onClick={() => {
                    setSearch("");
                    setSelectedTagId(null);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </motion.div>
          ) : viewMode === "kanban" ? (
            <div className="flex h-full min-h-[600px] gap-6 overflow-x-auto p-4 pb-8">
              {kanbanColumns.map((col) => {
                const columnContacts = filtered.filter(
                  (c) => ((c as any).lead_stage || "lead") === col.id
                );
                return (
                  <div
                    key={col.id}
                    className="flex w-[340px] shrink-0 flex-col rounded-md bg-[var(--surface)]/30 border border-[var(--border)] shadow-inner"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                  >
                    <div className="flex items-center justify-between p-5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-3 w-3 rounded-sm shadow-none", col.color)} />
                        <h3 className="font-bold text-[var(--ink)]">{col.title}</h3>
                      </div>
                      <Badge variant="secondary" className="rounded-sm px-2.5 py-0.5 font-bold">
                        {columnContacts.length}
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-4 p-4 overflow-y-auto">
                      <AnimatePresence>
                        {columnContacts.map((contact) => (
                          <motion.div
                            key={contact.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            draggable
                            onDragStart={(e: any) => handleDragStart(e, contact.id)}
                            className="group relative cursor-grab active:cursor-grabbing rounded-[1.25rem] border border-[var(--border)] bg-[var(--paper)] p-5 shadow-none hover:border-[var(--brand)]/40 hover:shadow-none hover:shadow-primary/5 transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3.5">
                                <div className="relative">
                                  <Avatar className="h-10 w-10 ring-2 ring-background shadow-none" src={contact.avatar_url} fallback={contact.display_name ?? "?"} />
                                  {contact.conversations && contact.conversations.length > 0 && (
                                    <div className="absolute -bottom-1.5 -right-1.5 flex -space-x-1.5">
                                      {Array.from(new Set(contact.conversations.map(c => c.platform))).slice(0, 3).map((platform, i) => (
                                        <div key={platform} className="flex h-5 w-5 items-center justify-center rounded-sm border-2 border-background bg-[var(--paper)] shadow-none z-10" style={{ zIndex: 10 - i }}>
                                          <PlatformIcon platform={platform as Platform} className="h-3 w-3" size={12} />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Link
                                    href={`/dashboard/contacts/${contact.id}`}
                                    className="font-bold text-sm text-[var(--ink)] hover:text-[var(--brand)] transition-colors block"
                                  >
                                    {contact.display_name ?? "Unknown"}
                                  </Link>
                                  {contact.email && (
                                    <p className="text-xs font-medium text-[var(--ink-2)] truncate max-w-[160px] mt-0.5">
                                      {contact.email}
                                    </p>
                                  )}
                                  {contact.conversations?.[0]?.channels?.display_name && (
                                    <div className="mt-2">
                                      <span
                                        className="inline-flex items-center gap-1.5 rounded-md bg-[var(--surface)]/80 px-2 py-1 text-[10px] font-bold text-[var(--ink-2)] border border-[var(--border)] max-w-[150px] truncate shadow-none"
                                        title={`Connected via ${contact.conversations[0].channels.display_name}`}
                                      >
                                        {contact.conversations[0].channels.profile_picture ? (
                                          <img
                                            src={contact.conversations[0].channels.profile_picture}
                                            alt=""
                                            className="h-3 w-3 rounded-sm object-cover shrink-0"
                                          />
                                        ) : (
                                          <PlatformIcon platform={contact.conversations[0].platform as any} className="h-3 w-3 shrink-0" size={12} />
                                        )}
                                        <span className="truncate">{contact.conversations[0].channels.display_name}</span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <GripVertical className="h-5 w-5 text-[var(--ink-2)]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ink-2)]">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(contact.last_interaction_at)}
                              </div>
                              {contact.contact_tags.length > 0 && (
                                <Badge variant="outline" className="text-[10px] px-2 h-5 font-bold shadow-none">
                                  {contact.contact_tags.length} tags
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto h-full">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)]/30">
                    <th className="px-6 py-4 text-left">
                      <input 
                        type="checkbox"
                        checked={selectedContacts.size > 0 && selectedContacts.size === filtered.length}
                        ref={input => {
                          if (input) {
                            input.indeterminate = selectedContacts.size > 0 && selectedContacts.size < filtered.length;
                          }
                        }}
                        onChange={toggleSelectAll}
                        className="rounded border-input text-[var(--brand)] focus:ring-primary h-4 w-4 shadow-none" 
                      />
                    </th>
                    <th className="px-6 py-4 text-left font-bold text-[var(--ink-2)] tracking-wider uppercase text-[10px]">Contact</th>
                    <th className="px-6 py-4 text-left font-bold text-[var(--ink-2)] tracking-wider uppercase text-[10px]">Contact Info</th>
                    <th className="px-6 py-4 text-left font-bold text-[var(--ink-2)] tracking-wider uppercase text-[10px]">Tags</th>
                    <th className="px-6 py-4 text-left font-bold text-[var(--ink-2)] tracking-wider uppercase text-[10px]">Last Active</th>
                    <th className="px-6 py-4 text-right font-bold text-[var(--ink-2)] tracking-wider uppercase text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {filtered.map((contact) => {
                      const contactTags = contact.contact_tags
                        .map((ct) => ct.tags)
                        .filter(Boolean) as Tag[];

                      return (
                        <motion.tr
                          variants={itemVariants}
                          key={contact.id}
                          className="transition-colors hover:bg-[var(--surface-2)] group"
                        >
                          <td className="px-6 py-4">
                            <input 
                              type="checkbox"
                              checked={selectedContacts.has(contact.id)}
                              onChange={() => toggleSelect(contact.id)}
                              className="rounded border-input text-[var(--brand)] focus:ring-primary h-4 w-4 shadow-none"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <Avatar className="h-10 w-10 ring-2 ring-background shadow-none" src={contact.avatar_url} fallback={contact.display_name ?? "?"} />
                                {contact.conversations && contact.conversations.length > 0 && (
                                  <div className="absolute -bottom-1.5 -right-1.5 flex -space-x-1.5">
                                    {Array.from(new Set(contact.conversations.map(c => c.platform))).slice(0, 3).map((platform, i) => (
                                      <div key={platform} className="flex h-5 w-5 items-center justify-center rounded-sm border-2 border-background bg-[var(--paper)] shadow-none z-10" style={{ zIndex: 10 - i }}>
                                        <PlatformIcon platform={platform as Platform} className="h-3 w-3" size={12} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div>
                                <Link
                                  href={`/dashboard/contacts/${contact.id}`}
                                  className="font-bold text-[var(--ink)] hover:text-[var(--brand)] transition-colors block text-sm"
                                >
                                  {contact.display_name ?? "Unknown"}
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[11px] text-[var(--ink-2)] capitalize font-bold">
                                    {(contact as any).lead_stage || "Lead"}
                                  </span>
                                  {contact.conversations?.[0]?.channels?.display_name && (
                                    <span
                                      className="inline-flex items-center gap-1 rounded bg-[var(--surface)]/80 px-1.5 py-0.5 text-[10px] font-bold text-[var(--ink-2)] border border-[var(--border)] max-w-[140px] truncate shadow-none"
                                      title={`Connected via ${contact.conversations[0].channels.display_name}`}
                                    >
                                      <PlatformIcon platform={contact.conversations[0].platform as any} className="h-2.5 w-2.5 shrink-0" size={10} />
                                      <span className="truncate">{contact.conversations[0].channels.display_name}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
                              {contact.email ? (
                                <span className="flex items-center gap-2 truncate max-w-[200px] font-medium" title={contact.email}>
                                  <Mail className="h-4 w-4 shrink-0" />
                                  <span className="truncate">{contact.email}</span>
                                </span>
                              ) : (
                                <span className="text-xs text-[var(--ink-2)]/50 italic font-medium">No email provided</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {contactTags.length > 0 ? (
                              <div className="flex flex-wrap gap-2 max-w-[220px]">
                                {contactTags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold shadow-none"
                                    style={
                                      tag.color
                                        ? {
                                            backgroundColor: `${tag.color}15`,
                                            borderColor: `${tag.color}30`,
                                            color: tag.color,
                                          }
                                        : undefined
                                    }
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                                {contactTags.length > 3 && (
                                  <Badge variant="secondary" className="text-[11px] px-2 font-bold shadow-none">
                                    +{contactTags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-[var(--ink-2)]/50 italic font-medium">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-2 text-sm text-[var(--ink-2)] font-semibold">
                              <Calendar className="h-4 w-4" />
                              {formatDate(contact.last_interaction_at)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
      {/* Export Contacts Modal */}
      <ExportContactsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        contacts={localContacts}
        filteredContacts={filtered}
        selectedContactIds={selectedContacts}
        totalWorkspaceContacts={contacts.length}
      />

      {/* Import Contacts Modal */}
      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        workspaceId={workspaceId}
        onSuccess={handleRefreshContacts}
      />
    </div>
  );
}
