import { useState, useRef } from "react";
import { Form, useSubmit } from "react-router";
import { IconX, IconScan, IconLoader2, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import styles from "./add-item-modal.module.css";

interface Props {
  className?: string;
  onClose: () => void;
  item?: any;
  isDuplicate?: boolean;
}

type ScanState = "idle" | "scanning" | "success";

const steps = ["Basic Info", "Purchase Details", "Marketplace"];

export function AddItemModal({ className, onClose, item, isDuplicate = false }: Props) {
  const [step, setStep] = useState(0);
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  // Controlled fields that OCR can pre-fill
  const [sku, setSku] = useState<string>(item?.sku ?? "");
  const [name, setName] = useState<string>(item?.name ?? "");
  const [purchasePrice, setPurchasePrice] = useState<string>(
    item?.purchasePrice ? String(Number(item.purchasePrice)) : "",
  );

  const [scanState, setScanState] = useState<ScanState>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset so same file can be re-selected
    e.target.value = "";

    setScanState("scanning");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ai/ocr", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error ?? "OCR extraction failed.");
      }

      const { sku: extractedSku, name: extractedName, purchasePrice: extractedPrice } = result.data;

      if (extractedSku) setSku(extractedSku);
      if (extractedName) setName(extractedName);
      if (extractedPrice != null) setPurchasePrice(String(extractedPrice));

      setScanState("success");

      const filledFields = [
        extractedSku && "SKU",
        extractedName && "Name",
        extractedPrice != null && "Purchase Price",
      ].filter(Boolean);

      if (filledFields.length > 0) {
        toast.success(`Auto-filled: ${filledFields.join(", ")}`);
      } else {
        toast.info("No data could be extracted. Please fill the form manually.");
        setScanState("idle");
        return;
      }

      setTimeout(() => setScanState("idle"), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "OCR extraction failed.";
      toast.error(message);
      setScanState("idle");
    }
  };

  const scanButtonLabel =
    scanState === "scanning" ? "Scanning…" : scanState === "success" ? "Extracted!" : "Scan Receipt / Invoice";

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={[styles.modal, className].filter(Boolean).join(" ")}>
        <div className={styles.header}>
          <span className={styles.title}>
            {isDuplicate ? "Duplicate Inventory Item" : item ? "Edit Inventory Item" : "Add Inventory Item"}
          </span>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>
        <div className={styles.steps}>
          {steps.map((s, i) => (
            <div key={s} className={[styles.step, i === step ? styles.active : ""].join(" ")} onClick={() => setStep(i)}>
              Step {i + 1}: {s}
            </div>
          ))}
        </div>
        <Form ref={formRef} method="post" action="/app/inventory">
          <input type="hidden" name="intent" value={item && !isDuplicate ? "update" : "create"} />
          {item && !isDuplicate && <input type="hidden" name="itemId" value={item.id} />}
          <div className={styles.body}>
          <div style={{ display: step === 0 ? "block" : "none" }}>
            {/* ── AI Scan Receipt Button ── */}
            <div className={styles.scanArea}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={styles.hiddenFileInput}
                onChange={handleFileChange}
                aria-label="Upload receipt or invoice image"
                id="receipt-scan-input"
              />
              <button
                type="button"
                id="scan-receipt-btn"
                className={[
                  styles.scanBtn,
                  scanState === "scanning" ? styles.scanning : "",
                  scanState === "success" ? styles.scanSuccess : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={handleScanClick}
                disabled={scanState === "scanning"}
                aria-live="polite"
              >
                <span className={styles.scanIcon}>
                  {scanState === "scanning" ? (
                    <IconLoader2 size={16} className={styles.spinnerIcon} />
                  ) : scanState === "success" ? (
                    <IconCheck size={16} />
                  ) : (
                    <IconScan size={16} />
                  )}
                </span>
                {scanButtonLabel}
              </button>
              <span className={styles.scanHint}>AI will auto-fill SKU, name &amp; price from your image</span>
            </div>

            {/* ── Basic Info Fields ── */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="field-sku">
                SKU *
              </label>
              <input
                id="field-sku"
                name="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className={styles.input}
                placeholder="e.g. DD1391-100"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="field-name">
                Product Name *
              </label>
              <input
                id="field-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="e.g. Air Jordan 1 Retro High OG Chicago"
                required
              />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="field-brand">
                  Brand *
                </label>
                <input
                  id="field-brand"
                  name="brand"
                  defaultValue={item?.brand}
                  className={styles.input}
                  placeholder="Nike"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="field-size">
                  Size *
                </label>
                <input
                  id="field-size"
                  name="size"
                  defaultValue={item?.size}
                  className={styles.input}
                  placeholder="10.5"
                  required
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="field-colorway">
                Colorway
              </label>
              <input
                id="field-colorway"
                name="colorway"
                className={styles.input}
                placeholder="e.g. Varsity Red/Black/White"
              />
            </div>
          </div>
          
          <div style={{ display: step === 1 ? "block" : "none" }}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="field-purchase-price">
                  Purchase Price *
                </label>
                <input
                  id="field-purchase-price"
                  name="purchasePrice"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className={styles.input}
                  type="number"
                  placeholder="170"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="field-purchase-date">
                  Purchase Date *
                </label>
                <input
                  id="field-purchase-date"
                  name="purchaseDate"
                  defaultValue={item?.purchaseDate ? new Date(item.purchaseDate).toISOString().split("T")[0] : ""}
                  className={styles.input}
                  type="date"
                  required
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="field-condition">
                Condition
              </label>
              <select
                id="field-condition"
                name="condition"
                defaultValue={item?.condition || "DEADSTOCK"}
                className={styles.input}
              >
                <option value="DEADSTOCK">Deadstock</option>
                <option value="NEW_WITH_BOX">New with Box</option>
                <option value="USED">Used</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="field-notes">
                Notes
              </label>
              <textarea id="field-notes" name="notes" className={styles.input} rows={3} placeholder="Any additional notes..." />
            </div>
          </div>

          <div style={{ display: step === 2 ? "block" : "none" }}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="field-marketplace">
                Listing Marketplace
              </label>
              <select id="field-marketplace" className={styles.input}>
                <option value="">Not listed</option>
                <option>StockX</option>
                <option>GOAT</option>
                <option>eBay</option>
                <option>Flight Club</option>
                <option>Stadium Goods</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="field-asking-price">
                Asking Price
              </label>
              <input id="field-asking-price" className={styles.input} type="number" placeholder="Optional" />
            </div>
          </div>
          </div>
          <div className={styles.footer}>
            {step > 0 ? (
              <button type="button" className={styles.backBtn} onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            ) : (
              <button type="button" className={styles.backBtn} onClick={onClose}>
                Cancel
              </button>
            )}

            {step < 2 ? (
              <button type="button" className={styles.nextBtn} onClick={() => setStep((s) => s + 1)}>
                Next
              </button>
            ) : (
              <button 
                type="button" 
                data-testid="submit-add-item"
                className={styles.nextBtn}
                onClick={(e) => {
                  e.preventDefault();
                  if (formRef.current) {
                    submit(formRef.current, { method: "post", action: "/app/inventory" });
                  }
                }}
              >
                {isDuplicate ? "Duplicate Item" : item ? "Save Changes" : "Add Item"}
              </button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
