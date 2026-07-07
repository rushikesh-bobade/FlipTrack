import { useState, useRef } from "react";
import { Form } from "react-router";
import {
  IconX,
  IconScan,
  IconLoader2,
  IconCheck,
  IconPhoto,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { toast } from "sonner";
import styles from "./add-item-modal.module.css";

interface Props {
  className?: string;
  onClose: () => void;
  item?: any;
  isDuplicate?: boolean;
}

type ScanState = "idle" | "scanning" | "success";
type UploadState = "idle" | "uploading" | "done" | "error";

const steps = ["Basic Info", "Purchase Details", "Marketplace"];

export function AddItemModal({ className, onClose, item, isDuplicate = false }: Props) {
  const [step, setStep] = useState(0);

  // Controlled fields that OCR can pre-fill
  const [sku, setSku] = useState<string>(item?.sku ?? "");
  const [name, setName] = useState<string>(item?.name ?? "");
  const [purchasePrice, setPurchasePrice] = useState<string>(
    item?.purchasePrice ? String(Number(item.purchasePrice)) : "",
  );

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string>(item?.imageUrl ?? "");
  const [imagePreview, setImagePreview] = useState<string>(item?.imageUrl ?? "");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  /** Handle item image selection and upload to Supabase Storage */
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so the same file can be re-selected if needed
    e.target.value = "";

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setUploadState("uploading");

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch("/api/inventory/upload-image", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error ?? "Upload failed.");
      }

      setImageUrl(data.url);
      setUploadState("done");
      toast.success("Image uploaded successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Image upload failed.";
      toast.error(message);
      setImageUrl("");
      setImagePreview("");
      setUploadState("error");
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImagePreview("");
    setUploadState("idle");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
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
        <Form method="post" action="/app/inventory">
          <input type="hidden" name="intent" value={item && !isDuplicate ? "update" : "create"} />
          {item && !isDuplicate && <input type="hidden" name="itemId" value={item.id} />}
          {/* Hidden field to carry the uploaded image URL to the server */}
          <input type="hidden" name="imageUrl" value={imageUrl} />
          <div className={styles.body}>
            {step === 0 && (
              <>
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

                {/* ── Image Upload ── */}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="field-item-image">
                    Item / Receipt Photo
                  </label>
                  <input
                    ref={imageInputRef}
                    id="field-item-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={styles.hiddenFileInput}
                    onChange={handleImageSelect}
                    aria-label="Upload item or receipt photo"
                  />
                  {imagePreview ? (
                    <div className={styles.imagePreviewWrapper}>
                      <img
                        src={imagePreview}
                        alt="Item preview"
                        className={styles.imagePreview}
                      />
                      <div className={styles.imagePreviewOverlay}>
                        {uploadState === "uploading" && (
                          <div className={styles.imageUploadingBadge}>
                            <IconLoader2 size={14} className={styles.spinnerIcon} />
                            Uploading…
                          </div>
                        )}
                        {uploadState === "done" && (
                          <div className={styles.imageUploadedBadge}>
                            <IconCheck size={14} />
                            Uploaded
                          </div>
                        )}
                        <button
                          type="button"
                          className={styles.imageRemoveBtn}
                          onClick={handleRemoveImage}
                          aria-label="Remove image"
                          title="Remove image"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id="upload-item-image-btn"
                      className={styles.imageUploadBtn}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <IconPhoto size={20} />
                      <span>
                        <strong>Click to upload</strong> item photo or receipt
                      </span>
                      <span className={styles.imageUploadHint}>JPEG, PNG, WebP or GIF · max 5 MB</span>
                      <IconUpload size={14} className={styles.imageUploadIcon} />
                    </button>
                  )}
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
              </>
            )}
            {step === 1 && (
              <>
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
              </>
            )}
            {step === 2 && (
              <>
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
              </>
            )}
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
              <button type="submit" className={styles.nextBtn} disabled={uploadState === "uploading"}>
                {isDuplicate ? "Duplicate Item" : item ? "Save Changes" : "Add Item"}
              </button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
