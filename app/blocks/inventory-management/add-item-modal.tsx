import { useState } from "react";
import { Form } from "react-router";
import { IconX } from "@tabler/icons-react";
import styles from "./add-item-modal.module.css";

interface Props { className?: string; onClose: () => void; item?: any; isDuplicate?: boolean; }

const steps = ["Basic Info", "Purchase Details", "Marketplace"];

export function AddItemModal({ className, onClose, item, isDuplicate = false }: Props) {
  const [step, setStep] = useState(0);
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={[styles.modal, className].filter(Boolean).join(" ")}>
        <div className={styles.header}>
          <span className={styles.title}>{isDuplicate ? "Duplicate Inventory Item" : item ? "Edit Inventory Item" : "Add Inventory Item"}</span>
          <button className={styles.closeBtn} onClick={onClose}><IconX size={18} /></button>
        </div>
        <div className={styles.steps}>
          {steps.map((s, i) => (
            <div key={s} className={[styles.step, i === step ? styles.active : ""].join(" ")} onClick={() => setStep(i)}>Step {i+1}: {s}</div>
          ))}
        </div>
        <Form method="post" action="/app/inventory" onSubmit={() => onClose()}>
          <input type="hidden" name="intent" value={item && !isDuplicate ? "update" : "create"} />
          {item && !isDuplicate && (<input type="hidden" name="itemId" value={item.id} />)}
          <div className={styles.body}>
          {step === 0 && (
            <>
              <div className={styles.field}><label className={styles.label}>SKU *</label><input name="sku" defaultValue={item?.sku} className={styles.input} placeholder="e.g. DD1391-100" required /></div>
              <div className={styles.field}><label className={styles.label}>Product Name *</label><input name="name" defaultValue={item?.name} className={styles.input} placeholder="e.g. Air Jordan 1 Retro High OG Chicago" required /></div>
              <div className={styles.row}>
                <div className={styles.field}><label className={styles.label}>Brand *</label><input name="brand" defaultValue={item?.brand} className={styles.input} placeholder="Nike" required /></div>
                <div className={styles.field}><label className={styles.label}>Size *</label><input name="size" defaultValue={item?.size} className={styles.input} placeholder="10.5" required /></div>
              </div>
              <div className={styles.field}><label className={styles.label}>Colorway</label><input name="colorway" className={styles.input} placeholder="e.g. Varsity Red/Black/White" /></div>
            </>
          )}
          {step === 1 && (
            <>
              <div className={styles.row}>
                <div className={styles.field}><label className={styles.label}>Purchase Price *</label><input name="purchasePrice" defaultValue={item?.purchasePrice ? Number(item.purchasePrice) : ''} className={styles.input} type="number" placeholder="170" required /></div>
                <div className={styles.field}><label className={styles.label}>Purchase Date *</label><input name="purchaseDate" defaultValue={item?.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : ''} className={styles.input} type="date" required /></div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Condition</label>
                <select name="condition" defaultValue={item?.condition || "DEADSTOCK"} className={styles.input}><option value="DEADSTOCK">Deadstock</option><option value="NEW_WITH_BOX">New with Box</option><option value="USED">Used</option></select>
              </div>
              <div className={styles.field}><label className={styles.label}>Notes</label><textarea name="notes" className={styles.input} rows={3} placeholder="Any additional notes..."></textarea></div>
            </>
          )}
          {step === 2 && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Listing Marketplace</label>
                <select className={styles.input}><option value="">Not listed</option><option>StockX</option><option>GOAT</option><option>eBay</option><option>Flight Club</option><option>Stadium Goods</option></select>
              </div>
              <div className={styles.field}><label className={styles.label}>Asking Price</label><input className={styles.input} type="number" placeholder="Optional" /></div>
            </>
          )}
          </div>
          <div className={styles.footer}>
            {step > 0 ? (
              <button type="button" className={styles.backBtn} onClick={() => setStep(s => s - 1)}>Back</button>
            ) : (
              <button type="button" className={styles.backBtn} onClick={onClose}>Cancel</button>
            )}
            
            {step < 2 ? (
              <button type="button" className={styles.nextBtn} onClick={() => setStep(s => s + 1)}>Next</button>
            ) : (
              <button type="submit" className={styles.nextBtn}>{ isDuplicate ? "Duplicate Item" : item ? "Save Changes" : "Add Item"}</button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
