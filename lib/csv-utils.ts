/**
 * Client-side robust CSV parsing and serialization utility.
 * Handles quoted fields, commas inside quotes, multi-line values, CRLF, and UTF-8 BOM.
 */

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parses raw CSV text into headers and an array of objects.
 */
export function parseCSV(csvText: string): ParsedCSV {
  // Strip BOM if present
  let text = csvText.replace(/^\uFEFF/, "").trim();
  if (!text) return { headers: [], rows: [] };

  const lines: string[][] = [];
  let currentField = "";
  let inQuotes = false;
  let currentRow: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\r" || char === "\n") {
        currentRow.push(currentField.trim());
        currentField = "";
        if (currentRow.some((c) => c !== "")) {
          lines.push(currentRow);
        }
        currentRow = [];
        // Skip \n if we just handled \r
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
      } else {
        currentField += char;
      }
    }
  }

  // Push remainder
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((c) => c !== "")) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const rawHeaders = lines[0].map((h) => h.trim());
  // Ensure unique headers
  const headers = rawHeaders.map((h, idx) => h || `Column_${idx + 1}`);

  const rows = lines.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index] || "";
    });
    return record;
  });

  return { headers, rows };
}

/**
 * Escapes a single value for safe CSV output according to RFC 4180.
 */
function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts headers and row objects into a downloadable CSV string with UTF-8 BOM.
 */
export function generateCSV(headers: { key: string; label: string }[], rows: Record<string, any>[]): string {
  const headerLine = headers.map((h) => escapeCSVValue(h.label)).join(",");
  const dataLines = rows.map((row) => {
    return headers.map((h) => escapeCSVValue(row[h.key])).join(",");
  });

  // \uFEFF ensures Excel / Numbers opens UTF-8 Arabic, Latin, and Emoji characters seamlessly
  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}

/**
 * Triggers a browser file download of CSV text.
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
