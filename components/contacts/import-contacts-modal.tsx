"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  X,
  FileText,
  HelpCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseCSV, downloadCSV } from "@/lib/csv-utils";
import { LEAD_STAGE_OPTIONS } from "@/lib/crm";

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

type Step = "upload" | "mapping" | "preview" | "importing" | "complete";

export function ImportContactsModal({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: ImportContactsModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);

  // Column Mapping
  const [columnMapping, setColumnMapping] = useState<{
    name: string;
    email: string;
    phone: string;
    leadStage: string;
    tags: string;
  }>({
    name: "",
    email: "",
    phone: "",
    leadStage: "",
    tags: "",
  });

  // Settings
  const [defaultStage, setDefaultStage] = useState("lead");
  const [updateExisting, setUpdateExisting] = useState(true);

  // Status/Results
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultSummary, setResultSummary] = useState<{
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep("upload");
    setFileName("");
    setCsvHeaders([]);
    setRawRows([]);
    setResultSummary(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const { headers, rows } = parseCSV(content);
      if (headers.length === 0 || rows.length === 0) {
        alert("The uploaded file seems to be empty or has an invalid CSV format.");
        return;
      }

      setCsvHeaders(headers);
      setRawRows(rows);

      // Auto-detect mappings based on header names
      const autoMap = { name: "", email: "", phone: "", leadStage: "", tags: "" };
      headers.forEach((h) => {
        const lower = h.toLowerCase().trim();
        if (!autoMap.name && (lower.includes("name") || lower === "contact" || lower === "full name")) {
          autoMap.name = h;
        } else if (!autoMap.email && (lower.includes("email") || lower.includes("mail"))) {
          autoMap.email = h;
        } else if (!autoMap.phone && (lower.includes("phone") || lower.includes("mobile") || lower.includes("tel") || lower.includes("number"))) {
          autoMap.phone = h;
        } else if (!autoMap.leadStage && (lower.includes("stage") || lower.includes("status") || lower.includes("pipeline"))) {
          autoMap.leadStage = h;
        } else if (!autoMap.tags && (lower.includes("tag") || lower.includes("label") || lower.includes("category"))) {
          autoMap.tags = h;
        }
      });

      // Fallbacks if not auto-detected
      if (!autoMap.name && headers.length > 0) autoMap.name = headers[0];
      if (!autoMap.email && headers.find((h) => h.toLowerCase().includes("email"))) {
        autoMap.email = headers.find((h) => h.toLowerCase().includes("email"))!;
      }

      setColumnMapping(autoMap);
      setStep("mapping");
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCSV = () => {
    const sample = `Full Name,Email,Phone Number,Lead Stage,Tags
John Doe,john@example.com,+1234567890,lead,wholesale; high-intent
Sarah Connor,sarah@example.com,+1987654321,customer,vip; repeat-buyer
Ahmed Ali,ahmed@example.com,+201012345678,qualified,enterprise; cairo`;
    downloadCSV("crm_contacts_import_template.csv", sample);
  };

  const handleRunImport = async () => {
    setStep("importing");
    setIsProcessing(true);

    try {
      // Build normalized payload
      const contactsPayload = rawRows.map((row) => {
        const name = columnMapping.name ? row[columnMapping.name] : "";
        const email = columnMapping.email ? row[columnMapping.email] : "";
        const phone = columnMapping.phone ? row[columnMapping.phone] : "";
        const leadStage = columnMapping.leadStage ? row[columnMapping.leadStage] : "";
        const rawTags = columnMapping.tags ? row[columnMapping.tags] : "";

        const tags = rawTags
          ? rawTags
              .split(/[;,|]/)
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

        // All other mapped columns can be saved as custom fields
        const customFields: Record<string, string> = {};
        const mappedColumns = new Set(Object.values(columnMapping).filter(Boolean));
        csvHeaders.forEach((h) => {
          if (!mappedColumns.has(h) && row[h]) {
            customFields[h] = row[h];
          }
        });

        return {
          name,
          email,
          phone,
          leadStage,
          tags,
          customFields,
        };
      });

      const res = await fetch("/api/v1/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          contacts: contactsPayload,
          defaultStage,
          updateExisting,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to complete import.");
      }

      setResultSummary({
        imported: data.importedCount || 0,
        updated: data.updatedCount || 0,
        skipped: data.skippedCount || 0,
        errors: data.errors || [],
      });

      setStep("complete");
      onSuccess();
    } catch (err) {
      alert((err as Error).message);
      setStep("mapping");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Import CRM Contacts</h3>
              <p className="text-xs text-muted-foreground">
                Batch import customer profiles, tags, and stage pipelines via CSV
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

        {/* Step Indicator */}
        <div className="mt-4 flex items-center justify-between border-b border-border/50 pb-3 text-xs">
          <div className={`flex items-center gap-1.5 font-medium ${step === "upload" ? "text-primary font-bold" : "text-muted-foreground"}`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px]">1</span>
            Upload File
          </div>
          <div className={`flex items-center gap-1.5 font-medium ${step === "mapping" ? "text-primary font-bold" : "text-muted-foreground"}`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px]">2</span>
            Map Columns
          </div>
          <div className={`flex items-center gap-1.5 font-medium ${step === "preview" ? "text-primary font-bold" : "text-muted-foreground"}`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px]">3</span>
            Preview & Options
          </div>
          <div className={`flex items-center gap-1.5 font-medium ${step === "complete" ? "text-emerald-500 font-bold" : "text-muted-foreground"}`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px]">4</span>
            Done
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="mt-5 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-center"
            >
              <UploadCloud className="h-10 w-10 text-primary mb-3" />
              <p className="font-semibold text-sm text-foreground">
                Click to browse or drag & drop CSV file
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .csv files up to 10MB with UTF-8 encoding
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4 text-primary" />
                <span>Need a ready-made template to organize your contacts?</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="font-semibold text-primary hover:underline"
              >
                Download Sample CSV
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Mapping */}
        {step === "mapping" && (
          <div className="mt-5 space-y-4 max-h-[380px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
              <span>File: <strong>{fileName}</strong> ({rawRows.length} rows detected)</span>
              <button onClick={handleReset} className="text-primary hover:underline text-xs">Change file</button>
            </div>

            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Match CSV Columns to Contact Attributes
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground flex items-center gap-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <select
                  value={columnMapping.name}
                  onChange={(e) => setColumnMapping({ ...columnMapping, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs outline-none focus:border-primary"
                >
                  <option value="">-- Select column --</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Email Address</label>
                <select
                  value={columnMapping.email}
                  onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs outline-none focus:border-primary"
                >
                  <option value="">-- None / Skip --</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Phone Number</label>
                <select
                  value={columnMapping.phone}
                  onChange={(e) => setColumnMapping({ ...columnMapping, phone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs outline-none focus:border-primary"
                >
                  <option value="">-- None / Skip --</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Lead Stage */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Lead Stage</label>
                <select
                  value={columnMapping.leadStage}
                  onChange={(e) => setColumnMapping({ ...columnMapping, leadStage: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs outline-none focus:border-primary"
                >
                  <option value="">-- Use default stage --</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-medium text-foreground">
                  Tags (Separated by comma or semicolon)
                </label>
                <select
                  value={columnMapping.tags}
                  onChange={(e) => setColumnMapping({ ...columnMapping, tags: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs outline-none focus:border-primary"
                >
                  <option value="">-- None / Skip --</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">Import Options</span>
              <div className="flex items-center justify-between text-xs">
                <span>Default Stage for new contacts:</span>
                <select
                  value={defaultStage}
                  onChange={(e) => setDefaultStage(e.target.value)}
                  className="rounded border border-border bg-background px-2 py-1 text-xs"
                >
                  {LEAD_STAGE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                  className="rounded border-border"
                />
                <span>Update details if contact already exists (by email/phone)</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && (
          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Preview of first 3 records to be imported
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {rawRows.slice(0, 3).map((row, idx) => {
                const name = columnMapping.name ? row[columnMapping.name] : "Unnamed";
                const email = columnMapping.email ? row[columnMapping.email] : "None";
                const phone = columnMapping.phone ? row[columnMapping.phone] : "None";
                const stage = columnMapping.leadStage && row[columnMapping.leadStage] ? row[columnMapping.leadStage] : defaultStage;

                return (
                  <div key={idx} className="rounded-xl border border-border p-3 text-xs bg-muted/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-foreground">{name}</strong>
                      <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase">{stage}</span>
                    </div>
                    <div className="text-muted-foreground flex gap-4 text-[11px]">
                      <span>Email: {email || "—"}</span>
                      <span>Phone: {phone || "—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              Ready to process <strong>{rawRows.length} contacts</strong> into your workspace CRM.
            </div>
          </div>
        )}

        {/* Step 4: Importing / Processing */}
        {step === "importing" && (
          <div className="mt-8 py-10 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <h4 className="font-bold text-sm text-foreground">Importing contacts...</h4>
            <p className="text-xs text-muted-foreground max-w-xs">
              Saving contact profiles, tags, and stage pipelines in your workspace.
            </p>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === "complete" && resultSummary && (
          <div className="mt-6 py-4 space-y-4">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-base text-foreground">Import Successfully Completed!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Your CRM contacts list has been updated.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-lg font-bold text-emerald-500">{resultSummary.imported}</div>
                <div className="text-[11px] text-muted-foreground">New Contacts</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-lg font-bold text-primary">{resultSummary.updated}</div>
                <div className="text-[11px] text-muted-foreground">Updated</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-lg font-bold text-muted-foreground">{resultSummary.skipped}</div>
                <div className="text-[11px] text-muted-foreground">Skipped</div>
              </div>
            </div>

            {resultSummary.errors.length > 0 && (
              <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive max-h-24 overflow-y-auto">
                <p className="font-semibold mb-1">Errors logged ({resultSummary.errors.length}):</p>
                {resultSummary.errors.map((e, idx) => (
                  <p key={idx} className="text-[11px]">• {e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          {step === "upload" && (
            <div className="flex justify-end w-full">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
            </div>
          )}

          {step === "mapping" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button
                size="sm"
                onClick={() => setStep("preview")}
                disabled={!columnMapping.name && !columnMapping.email && !columnMapping.phone}
                className="gap-1.5"
              >
                Continue to Preview
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep("mapping")}>
                Back
              </Button>
              <Button size="sm" onClick={handleRunImport} className="gap-1.5 shadow-sm">
                Start Importing ({rawRows.length})
              </Button>
            </>
          )}

          {step === "complete" && (
            <div className="flex justify-end w-full">
              <Button size="sm" onClick={onClose}>
                Close & View Contacts
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
