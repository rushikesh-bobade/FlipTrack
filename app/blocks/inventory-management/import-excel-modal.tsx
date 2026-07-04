import { useRef, useState } from "react";
import { useSubmit } from "react-router";
import { readSheet } from "read-excel-file/browser";
import { toast } from "sonner";
import { IconX, IconUpload } from "@tabler/icons-react";
import styles from "./import-excel-modal.module.css";

interface Props {
  className?: string;
  onClose: () => void;
}

interface ParsedImportItem {
  rowNumber: number;
  sku: string;
  name: string;
  brand: string;
  size: string | null;
  purchasePrice: number;
  purchaseDate: string;
  condition: string;
  currency: string;
  tags: string[];
  status: "IN_STOCK";
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function getCellValue(row: Record<string, unknown>, aliases: string[]) {
  const lookup = new Map(Object.entries(row).map(([key, value]) => [normalizeKey(key), value]));

  for (const alias of aliases) {
    const value = lookup.get(normalizeKey(alias));
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function getTextValue(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function parsePurchasePrice(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const text = getTextValue(value);
  if (!text) {
    return null;
  }

  const parsed = Number(text.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function excelDateToJSDate(serial: number) {
  return new Date((serial - 25569) * 86400 * 1000);
}

function parsePurchaseDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const date = excelDateToJSDate(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const text = getTextValue(value);
  if (!text) {
    return null;
  }

  const parsedDate = new Date(text);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function normalizeCondition(value: unknown) {
  const normalized = normalizeKey(getTextValue(value) || "");

  switch (normalized) {
    case "new":
      return "NEW";
    case "likenew":
      return "LIKE_NEW";
    case "usedexcellent":
      return "USED_EXCELLENT";
    case "usedgood":
      return "USED_GOOD";
    case "usedfair":
      return "USED_FAIR";
    case "refurbished":
      return "REFURBISHED";
    case "damaged":
      return "DAMAGED";
    case "newwithbox":
      return "NEW_WITH_BOX";
    case "used":
      return "USED";
    case "deadstock":
    default:
      return "DEADSTOCK";
  }
}

function normalizeCurrency(value: unknown) {
  const currency = getTextValue(value)?.toUpperCase();

  switch (currency) {
    case "CAD":
    case "GBP":
    case "EUR":
    case "AUD":
    case "JPY":
    case "USD":
      return currency;
    default:
      return "USD";
  }
}

function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let entry = "";
  let insideQuote = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuote) {
      if (char === '"') {
        if (nextChar === '"') {
          entry += '"';
          i += 2;
        } else {
          insideQuote = false;
          i++;
        }
      } else {
        entry += char;
        i++;
      }
    } else {
      if (char === '"') {
        insideQuote = true;
        i++;
      } else if (char === ',') {
        row.push(entry);
        entry = "";
        i++;
      } else if (char === '\r' || char === '\n') {
        row.push(entry);
        entry = "";
        result.push(row);
        row = [];
        if (char === '\r' && nextChar === '\n') {
          i += 2;
        } else {
          i++;
        }
      } else {
        entry += char;
        i++;
      }
    }
  }

  const endedWithNewline = text.endsWith('\n') || text.endsWith('\r');
  if (text.length > 0 && !endedWithNewline) {
    row.push(entry);
    result.push(row);
  }

  return result;
}

function sheetToJSON(rows: unknown[][]): Record<string, unknown>[] {
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => String(h || "").trim());
  return rows.slice(1).map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index] !== undefined ? row[index] : null;
      }
    });
    return obj;
  });
}

function parseSpreadsheetRows(rows: Record<string, unknown>[]) {
  const parsedItems: ParsedImportItem[] = [];
  const skippedRows: number[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const sku = getTextValue(getCellValue(row, ["SKU", "sku", "Product SKU"]));
    const name = getTextValue(getCellValue(row, ["Name", "name", "Item Name", "Product Name"]));
    const brand = getTextValue(getCellValue(row, ["Brand", "brand"]));
    const purchasePrice = parsePurchasePrice(getCellValue(row, ["Purchase Price", "purchasePrice", "Price", "Cost"]));
    const purchaseDate = parsePurchaseDate(getCellValue(row, ["Purchase Date", "purchaseDate", "Date Purchased"]));

    if (!sku || !name || !brand || purchasePrice === null || !purchaseDate) {
      skippedRows.push(rowNumber);
      return;
    }

    parsedItems.push({
      rowNumber,
      sku,
      name,
      brand,
      size: getTextValue(getCellValue(row, ["Size", "size"])),
      purchasePrice,
      purchaseDate: purchaseDate.toISOString(),
      condition: normalizeCondition(getCellValue(row, ["Condition"])),
      currency: normalizeCurrency(getCellValue(row, ["Currency"])),
      tags: [],
      status: "IN_STOCK",
    });
  });

  return { parsedItems, skippedRows };
}

export function ImportExcelModal({ className, onClose }: Props) {
  const submit = useSubmit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleClose = () => {
    if (!isLoading) {
      setSelectedFile(null);
      onClose();
    }
  };

  const validateFile = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const isCsv = file.type === "text/csv" || extension === "csv";
    const isXlsx = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || extension === "xlsx";

    if (!isCsv && !isXlsx) {
      toast.error("Unsupported file type. Please upload a .csv or .xlsx file.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Please upload a file smaller than 10MB.");
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    try {
      let rows: Record<string, unknown>[] = [];
      const extension = file.name.split(".").pop()?.toLowerCase();
      const isCsv = file.type === "text/csv" || extension === "csv";

      if (isCsv) {
        const text = await file.text();
        const parsedRows = parseCSV(text);
        rows = sheetToJSON(parsedRows);
      } else {
        const parsedRows = await readSheet(file);
        rows = sheetToJSON(parsedRows);
      }

      if (!rows.length) {
        toast.error("The selected file did not contain any importable rows.");
        return;
      }

      const { parsedItems, skippedRows } = parseSpreadsheetRows(rows);

      if (!parsedItems.length) {
        toast.error("No valid inventory rows were found in the file.");
        return;
      }

      const formData = new FormData();
      formData.set("intent", "import");
      formData.set("items", JSON.stringify(parsedItems));

      if (skippedRows.length > 0) {
        formData.set("skippedRows", JSON.stringify(skippedRows));
      }

      submit(formData, { method: "post", action: "/app/inventory" });
    } catch (error) {
      console.error("Inventory import failed", error);
      toast.error("Unable to parse the selected spreadsheet. Please check the file and try again.");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  return (
    <div className={styles.overlay} onClick={(event) => event.target === event.currentTarget && handleClose()}>
      <div className={[styles.modal, className].filter(Boolean).join(" ")}>
        <div className={styles.header}>
          <span className={styles.title}>Import from Excel / CSV</span>
          <button className={styles.closeBtn} onClick={handleClose} disabled={isLoading}>
            <IconX size={18} />
          </button>
        </div>
        <div className={styles.body}>
          <input
            ref={fileInputRef}
            className={styles.fileInput}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
          />
          <div
            className={[styles.dropzone, isDragging ? styles.dropzoneActive : ""].filter(Boolean).join(" ")}
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
          >
            <IconUpload size={36} className={styles.dropIcon} />
            <div className={styles.dropText}>Drop your Excel or CSV file here</div>
            <div className={styles.dropSub}>Supports .xlsx, .csv &mdash; max 10MB</div>
            {selectedFile && <div className={styles.selectedFile}>{selectedFile.name}</div>}
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={handleClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className={[styles.importBtn, selectedFile ? styles.importBtnReady : ""].filter(Boolean).join(" ")}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? "Importing..." : selectedFile ? "Choose Another File" : "Import Items"}
          </button>
        </div>
      </div>
    </div>
  );
}
