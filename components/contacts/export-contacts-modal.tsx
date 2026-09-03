"use client";

import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Check,
  Filter,
  CheckSquare,
  Square,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCSV, downloadCSV } from "@/lib/csv-utils";
import type { Database } from "@/lib/types/database";

type Tag = Database["public"]["Tables"]["tags"]["Row"];
type ContactWithTags = Database["public"]["Tables"]["contacts"]["Row"] & {
  contact_tags: {
    tag_id: string;
    tags: Tag | null;
  }[];
  conversations?: { platform: string }[];
};

interface ExportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: ContactWithTags[];
  filteredContacts: ContactWithTags[];
  selectedContactIds: Set<string>;
  totalWorkspaceContacts: number;
}

const AVAILABLE_FIELDS = [
  { key: "display_name", label: "Full Name", default: true },
  { key: "email", label: "Email Address", default: true },
  { key: "phone", label: "Phone Number", default: true },
  { key: "lead_stage", label: "Lead Stage", default: true },
  { key: "tags", label: "Tags", default: true },
  { key: "platforms", label: "Connected Platforms", default: true },
  { key: "is_subscribed", label: "Subscribed Status", default: true },
  { key: "last_interaction_at", label: "Last Interaction Date", default: true },
  { key: "created_at", label: "Date Added", default: false },
  { key: "id", label: "Contact ID", default: false },
];

export function ExportContactsModal({
  isOpen,
  onClose,
  contacts,
  filteredContacts,
  selectedContactIds,
  totalWorkspaceContacts,
}: ExportContactsModalProps) {
  const [exportScope, setExportScope] = useState<"all" | "filtered" | "selected">("all");
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(AVAILABLE_FIELDS.filter((f) => f.default).map((f) => f.key))
  );
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const toggleField = (key: string) => {
    const next = new Set(selectedFields);
    if (next.has(key)) {
      if (next.size > 1) next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedFields(next);
  };

  const toggleAllFields = () => {
    if (selectedFields.size === AVAILABLE_FIELDS.length) {
      setSelectedFields(new Set(["display_name", "email"]));
    } else {
      setSelectedFields(new Set(AVAILABLE_FIELDS.map((f) => f.key)));
    }
  };

  const getExportData = () => {
    let dataset: ContactWithTags[] = contacts;
    if (exportScope === "selected" && selectedContactIds.size > 0) {
      dataset = contacts.filter((c) => selectedContactIds.has(c.id));
    } else if (exportScope === "filtered") {
      dataset = filteredContacts;
    }

    return dataset.map((c) => {
      const meta = (c.metadata as Record<string, any>) || {};
      const phone = meta.phone || "";
      const tagsList = c.contact_tags
        ?.map((t) => t.tags?.name)
        .filter(Boolean)
        .join("; ");
      const platformList = c.conversations
        ?.map((conv) => conv.platform)
        .filter(Boolean)
        .join("; ");

      const row: Record<string, any> = {};

      if (selectedFields.has("display_name")) row.display_name = c.display_name || "";
      if (selectedFields.has("email")) row.email = c.email || "";
      if (selectedFields.has("phone")) row.phone = phone;
      if (selectedFields.has("lead_stage")) row.lead_stage = c.lead_stage || "lead";
      if (selectedFields.has("tags")) row.tags = tagsList;
      if (selectedFields.has("platforms")) row.platforms = platformList;
      if (selectedFields.has("is_subscribed")) row.is_subscribed = c.is_subscribed ? "Yes" : "No";
      if (selectedFields.has("last_interaction_at")) row.last_interaction_at = c.last_interaction_at ? new Date(c.last_interaction_at).toISOString() : "";
      if (selectedFields.has("created_at")) row.created_at = c.created_at ? new Date(c.created_at).toISOString() : "";
      if (selectedFields.has("id")) row.id = c.id;

      return row;
    });
  };

  const handleExecuteExport = () => {
    setIsExporting(true);
    try {
      const rows = getExportData();
      const headers = AVAILABLE_FIELDS.filter((f) => selectedFields.has(f.key)).map((f) => ({
        key: f.key,
        label: f.label,
      }));

      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `crm_contacts_${exportScope}_${dateStr}.csv`;
      const csv = generateCSV(headers, rows);
      downloadCSV(filename, csv);
      onClose();
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export contacts. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedCount = selectedContactIds.size;
  const filteredCount = filteredContacts.length;
  const totalCount = contacts.length;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Export CRM Contacts</h3>
              <p className="text-xs text-muted-foreground">
                Download your contacts as clean, Excel/Google Sheets ready CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Export Scope Selector */}
        <div className="mt-5">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Which contacts would you like to export?
          </label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setExportScope("all")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                exportScope === "all"
                  ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary"
                  : "border-border hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <span className="font-bold text-sm text-foreground">{totalCount}</span>
              <span className="text-[11px] mt-0.5">All Loaded</span>
            </button>

            <button
              type="button"
              onClick={() => setExportScope("filtered")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                exportScope === "filtered"
                  ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary"
                  : "border-border hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <span className="font-bold text-sm text-foreground">{filteredCount}</span>
              <span className="text-[11px] mt-0.5">Filtered View</span>
            </button>

            <button
              type="button"
              onClick={() => selectedCount > 0 && setExportScope("selected")}
              disabled={selectedCount === 0}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                exportScope === "selected"
                  ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary"
                  : selectedCount === 0
                  ? "opacity-50 cursor-not-allowed border-border"
                  : "border-border hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <span className="font-bold text-sm text-foreground">{selectedCount}</span>
              <span className="text-[11px] mt-0.5">Selected Only</span>
            </button>
          </div>
        </div>

        {/* Fields to include */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Columns to Include ({selectedFields.size}/{AVAILABLE_FIELDS.length})
            </label>
            <button
              type="button"
              onClick={toggleAllFields}
              className="text-xs text-primary hover:underline font-medium"
            >
              {selectedFields.size === AVAILABLE_FIELDS.length ? "Select Essential" : "Select All"}
            </button>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {AVAILABLE_FIELDS.map((f) => {
              const isChecked = selectedFields.has(f.key);
              return (
                <div
                  key={f.key}
                  onClick={() => toggleField(f.key)}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    isChecked
                      ? "border-primary/40 bg-primary/5 text-foreground font-medium"
                      : "border-border text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      isChecked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {isChecked && <Check className="h-3 w-3" />}
                  </div>
                  <span className="truncate">{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <div className="text-xs text-muted-foreground">
            Exporting{" "}
            <strong className="text-foreground">
              {exportScope === "selected"
                ? selectedCount
                : exportScope === "filtered"
                ? filteredCount
                : totalCount}{" "}
              contacts
            </strong>{" "}
            with {selectedFields.size} fields
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteExport}
              disabled={isExporting}
              className="gap-1.5 shadow-sm"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
