// CSV Export utilities

export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: unknown) => string;
}

/**
 * Converts data to CSV format and triggers download
 */
export function exportToCSV<T extends object>(
  data: T[],
  columns: ExportColumn[],
  filename: string
): void {
  if (!data || data.length === 0) {
    throw new Error("No data to export");
  }

  // Create CSV headers
  const headers = columns.map((col) => col.header).join(",");

  // Create CSV rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let value = (item as Record<string, unknown>)[col.key];

        // Apply formatter if provided
        if (col.formatter && value !== undefined && value !== null) {
          value = col.formatter(value);
        }

        // Handle null/undefined values
        if (value === null || value === undefined) {
          value = "";
        }

        // Convert to string and escape quotes
        const stringValue = String(value);

        // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      })
      .join(",");
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows].join("\n");

  // Create and trigger download
  downloadCSV(csvContent, filename);
}

/**
 * Triggers CSV file download
 */
function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Formats currency for CSV export
 */
export const formatCurrencyForCSV = (amount: unknown): string => {
  const numAmount = typeof amount === "number" ? amount : 0;
  return `₦${numAmount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Formats date for CSV export
 */
export const formatDateForCSV = (dateString: unknown): string => {
  const dateStr =
    typeof dateString === "string" ? dateString : String(dateString);
  try {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

/**
 * Formats boolean for CSV export
 */
export const formatBooleanForCSV = (value: unknown): string => {
  if (typeof value === "number") {
    return value === 1 ? "Yes" : "No";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return "No";
};

/**
 * Generate timestamp for filename
 */
export const generateTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}_${hours}${minutes}`;
};
