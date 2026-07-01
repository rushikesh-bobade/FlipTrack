import { useState, useRef, useCallback } from "react";
import { useFetcher } from "react-router";
import { IconX, IconUpload, IconFile, IconAlertCircle } from "@tabler/icons-react";
import * as XLSX from "xlsx";
import styles from "./import-excel-modal.module.css";

interface Props {
  className?: string;
  onClose: () => void;
}

const DB_FIELDS = [
  { key: "sku", label: "SKU *", required: true },
  { key: "name", label: "Product Name *", required: true },
  { key: "brand", label: "Brand *", required: true },
  { key: "size", label: "Size *", required: true },
  { key: "purchasePrice", label: "Purchase Price *", required: true },
  { key: "purchaseDate", label: "Purchase Date", required: false },
  { key: "condition", label: "Condition", required: false },
  { key: "status", label: "Status", required: false },
  { key: "colorway", label: "Colorway", required: false },
  { key: "marketplace", label: "Marketplace", required: false },
  { key: "askingPrice", label: "Asking Price", required: false },
  { key: "notes", label: "Notes", required: false },
  { key: "currency", label: "Currency", required: false },
  { key: "tags", label: "Tags", required: false },
] as const;

const HEADER_ALIASES: Record<string, string> = {
  sku: "sku",
  "article number": "sku",
  "article#": "sku",
  name: "name",
  "product name": "name",
  product: "name",
  "item name": "name",
  title: "name",
  brand: "brand",
  size: "size",
  "us size": "size",
  "eu size": "size",
  colorway: "colorway",
  color: "colorway",
  "purchase price": "purchasePrice",
  "purchase price ($)": "purchasePrice",
  price: "purchasePrice",
  cost: "purchasePrice",
  "purchase date": "purchaseDate",
  date: "purchaseDate",
  "date purchased": "purchaseDate",
  condition: "condition",
  status: "status",
  marketplace: "marketplace",
  platform: "marketplace",
  "asking price": "askingPrice",
  "listing price": "askingPrice",
  "list price": "askingPrice",
  notes: "notes",
  comments: "notes",
  description: "notes",
  currency: "currency",
  tags: "tags",
  "image url": "imageUrl",
  "image": "imageUrl",
  "photo url": "imageUrl",
};

function normalizeColumnName(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function autoDetectMapping(columns: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const col of columns) {
    const normalized = normalizeColumnName(col);
    const dbField = HEADER_ALIASES[normalized];
    if (dbField && !mapping[dbField]) {
      mapping[dbField] = col;
    }
  }
  return mapping;
}

export function ImportExcelModal({ className, onClose }: Props) {
  const fetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);

  const importing = fetcher.state !== "idle";

  const parseFile = useCallback((f: File) => {
    setParseError(null);
    if (f.size > 10 * 1024 * 1024) {
      setParseError("File exceeds the 10MB size limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          setParseError("No sheets found in the file.");
          return;
        }
        const sheet = workbook.Sheets[sheetName];
        const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        if (json.length === 0) {
          setParseError("No data rows found in the file.");
          return;
        }
        const cols = Object.keys(json[0]);
        if (cols.length === 0) {
          setParseError("No columns found in the file.");
          return;
        }
        setColumns(cols);
        setMapping(autoDetectMapping(cols));
        setParsedData(json);
        setPreviewRows(json.slice(0, 5));
        setFile(f);
      } catch (err) {
        setParseError("Failed to parse file. Make sure it's a valid Excel or CSV file.");
      }
    };
    reader.onerror = () => setParseError("Failed to read file.");
    reader.readAsArrayBuffer(f);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) parseFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) parseFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleMappingChange = (dbField: string, column: string) => {
    setMapping((prev) => ({ ...prev, [dbField]: column }));
  };

  const handleSubmit = () => {
    const requiredFields = DB_FIELDS.filter((f) => f.required);
    const missingMappings = requiredFields.filter((f) => !mapping[f.key]);
    if (missingMappings.length > 0) {
      setParseError(
        `Please map required fields: ${missingMappings.map((f) => f.label).join(", ")}`
      );
      return;
    }

    const items = parsedData.map((row) => {
      const item: Record<string, unknown> = {};
      for (const [dbField, col] of Object.entries(mapping)) {
        if (col) {
          item[dbField] = row[col];
        }
      }
      return item;
    });

    const formData = new FormData();
    formData.append("intent", "import");
    formData.append("items", JSON.stringify(items));
    fetcher.submit(formData, { method: "post" });
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={[styles.modal, className].filter(Boolean).join(" ")}>
        <div className={styles.header}>
          <span className={styles.title}>
            {file ? "Map Columns & Preview" : "Import from Excel / CSV"}
          </span>
          <button className={styles.closeBtn} onClick={onClose} disabled={importing}>
            <IconX size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {!file ? (
            <>
              <div
                className={[styles.dropzone, dragOver ? styles.dropzoneActive : ""].join(" ")}
                onClick={handleDropzoneClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleDropzoneClick(); }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className={styles.fileInput}
                  onChange={handleFileSelect}
                />
                <IconUpload size={36} className={styles.dropIcon} />
                <div className={styles.dropText}>Drop your Excel or CSV file here</div>
                <div className={styles.dropSub}>Supports .xlsx, .xls, .csv &mdash; max 10MB</div>
              </div>
              {parseError && (
                <div className={styles.error}>
                  <IconAlertCircle size={16} /> {parseError}
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.fileInfo}>
                <IconFile size={18} />
                <span>{file.name}</span>
                <span className={styles.fileInfoSize}>
                  ({(file.size / 1024).toFixed(1)} KB &middot; {parsedData.length} rows)
                </span>
              </div>

              {parseError && (
                <div className={styles.error}>
                  <IconAlertCircle size={16} /> {parseError}
                </div>
              )}

              <div className={styles.mappingSection}>
                <div className={styles.mappingTitle}>Column Mapping</div>
                <div className={styles.mappingSub}>
                  Map spreadsheet columns to inventory fields. Required fields are marked with *.
                </div>
                <div className={styles.mappingGrid}>
                  {DB_FIELDS.map((field) => (
                    <div key={field.key} className={styles.mappingRow}>
                      <label className={styles.mappingLabel}>
                        {field.label}
                      </label>
                      <select
                        className={styles.mappingSelect}
                        value={mapping[field.key] || ""}
                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      >
                        <option value="">-- Skip --</option>
                        {columns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.previewSection}>
                <div className={styles.previewTitle}>Preview (first {previewRows.length} rows)</div>
                <div className={styles.previewTableWrap}>
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        {columns.map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i}>
                          {columns.map((col) => (
                            <td key={col}>{String(row[col] ?? "").slice(0, 60)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={importing}>
            Cancel
          </button>
          {file && (
            <button
              className={styles.importBtn}
              onClick={handleSubmit}
              disabled={importing}
            >
              {importing ? "Importing..." : `Import ${parsedData.length} Items`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
