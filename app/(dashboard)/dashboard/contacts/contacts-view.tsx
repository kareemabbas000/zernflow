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
  GripVertical
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

type Tag = Database["public"]["Tables"]["tags"]["Row"];
type ContactWithTags = Database["public"]["Tables"]["contacts"]["Row"] & {
  contact_tags: {
    tag_id: string;
    tags: Tag | null;
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

export function ContactsView({
  contacts,
  tags,
  workspaceId,
}: {
  contacts: ContactWithTags[];
  tags: Tag[];
  workspaceId: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>(
    createEmptyFilter()
  );
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  
  const [localContacts, setLocalContacts] = useState(contacts);
  useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

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
    { id: "negotiation", title: "Negotiation", color: "bg-yellow-500" },
    { id: "won", title: "Closed Won", color: "bg-green-500" },
    { id: "lost", title: "Closed Lost", color: "bg-red-500" },
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-5 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your {contacts.length} customer relationships and segments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              Import Contacts
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex bg-muted p-1 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                className={cn("px-3 py-1 text-sm font-medium rounded-md transition-all", viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
              >
                <List className="h-4 w-4 inline-block mr-1.5" />
                List
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={cn("px-3 py-1 text-sm font-medium rounded-md transition-all", viewMode === "kanban" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
              >
                <Kanban className="h-4 w-4 inline-block mr-1.5" />
                Board
              </button>
            </div>
            <Button
              variant={showSegmentBuilder ? "default" : "outline"}
              onClick={() => setShowSegmentBuilder(!showSegmentBuilder)}
              className="gap-2 h-9"
            >
              <Filter className="h-4 w-4" />
              Segment
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  showSegmentBuilder && "rotate-180"
                )}
              />
            </Button>
          </div>
          
          {selectedContacts.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
              <span className="text-sm font-medium text-muted-foreground px-2">
                {selectedContacts.size} selected
              </span>
              <Button variant="secondary" size="sm" className="gap-2">
                <Tags className="h-3.5 w-3.5" />
                Add Tags
              </Button>
            </div>
          )}
        </div>

        {/* Segment builder dropdown */}
        {showSegmentBuilder && (
          <div className="mt-4 p-4 rounded-xl border border-border bg-card shadow-sm animate-in slide-in-from-top-2">
            <SegmentBuilder
              value={segmentFilter}
              onChange={setSegmentFilter}
              workspaceId={workspaceId}
            />
          </div>
        )}

        {/* Tag pills */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant={selectedTagId === null ? "default" : "secondary"}
              className="cursor-pointer"
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
                  "cursor-pointer transition-all",
                  selectedTagId === tag.id && "ring-2 ring-primary ring-offset-1 border-transparent"
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-muted/10 p-6">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 mb-4">
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No contacts found</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                {search || selectedTagId ? "Try adjusting your filters or search query." : "Contacts will automatically appear here when customers message you."}
              </p>
              {(search || selectedTagId) && (
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => {
                    setSearch("");
                    setSelectedTagId(null);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : viewMode === "kanban" ? (
            <div className="flex h-full min-h-[600px] gap-6 overflow-x-auto p-2 pb-6">
              {kanbanColumns.map((col) => {
                const columnContacts = filtered.filter(
                  (c) => ((c as any).lead_stage || "lead") === col.id
                );
                return (
                  <div
                    key={col.id}
                    className="flex w-80 shrink-0 flex-col rounded-xl bg-muted/40 border border-border"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                  >
                    <div className="flex items-center justify-between p-4 pb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-full", col.color)} />
                        <h3 className="font-semibold">{col.title}</h3>
                      </div>
                      <Badge variant="secondary" className="rounded-full px-2 py-0">
                        {columnContacts.length}
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-3 p-3 overflow-y-auto">
                      {columnContacts.map((contact) => (
                        <div
                          key={contact.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, contact.id)}
                          className="group relative cursor-grab active:cursor-grabbing rounded-lg border border-border bg-card p-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8" src={contact.avatar_url} fallback={contact.display_name ?? "?"} />
                              <div>
                                <Link
                                  href={`/dashboard/contacts/${contact.id}`}
                                  className="font-medium text-sm text-foreground hover:text-primary transition-colors"
                                >
                                  {contact.display_name ?? "Unknown"}
                                </Link>
                                {contact.email && (
                                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                    {contact.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            <GripVertical className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(contact.last_interaction_at)}
                            </div>
                            {contact.contact_tags.length > 0 && (
                              <Badge variant="outline" className="text-[9px] px-1.5 h-4">
                                {contact.contact_tags.length} tags
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left">
                      <input 
                        type="checkbox"
                        checked={selectedContacts.size > 0 && selectedContacts.size === filtered.length}
                        ref={input => {
                          if (input) {
                            input.indeterminate = selectedContacts.size > 0 && selectedContacts.size < filtered.length;
                          }
                        }}
                        onChange={toggleSelectAll}
                        className="rounded border-input text-primary focus:ring-primary h-4 w-4" 
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact Info</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tags</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Active</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((contact) => {
                    const contactTags = contact.contact_tags
                      .map((ct) => ct.tags)
                      .filter(Boolean) as Tag[];

                    return (
                      <tr
                        key={contact.id}
                        className="transition-colors hover:bg-muted/30 group"
                      >
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox"
                            checked={selectedContacts.has(contact.id)}
                            onChange={() => toggleSelect(contact.id)}
                            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar src={contact.avatar_url} fallback={contact.display_name ?? "?"} />
                            <div>
                              <Link
                                href={`/dashboard/contacts/${contact.id}`}
                                className="font-semibold text-foreground hover:text-primary transition-colors"
                              >
                                {contact.display_name ?? "Unknown"}
                              </Link>
                              <div className="text-xs text-muted-foreground mt-0.5 capitalize font-medium">
                                {(contact as any).lead_stage || "Lead"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            {contact.email ? (
                              <span className="flex items-center gap-1.5 truncate max-w-[200px]" title={contact.email}>
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{contact.email}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/50 italic">No email</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {contactTags.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                              {contactTags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium"
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
                                <Badge variant="secondary" className="text-[10px] px-1.5">
                                  +{contactTags.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/50 italic">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(contact.last_interaction_at)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
