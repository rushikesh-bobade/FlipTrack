import { IconX } from "@tabler/icons-react";
import { Form } from "react-router";
import styles from "./create-alert-form.module.css";

interface Props { className?: string; onClose: () => void; }

export function CreateAlertForm({ className, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <Form method="post" className={[styles.modal, className].filter(Boolean).join(" ")} onSubmit={onClose}>
        <input type="hidden" name="intent" value="create" />
        <div className={styles.header}>
          <span className={styles.title}>Create Price Alert</span>
          <button type="button" className={styles.closeBtn} onClick={onClose}><IconX size={18} /></button>
        </div>
        <div className={styles.body}>
          <div className={styles.field}><label className={styles.label}>Product / SKU *</label><input name="sku" required className={styles.input} placeholder="e.g. model number or UPC" /></div>
          <div className={styles.field}><label className={styles.label}>Product Name *</label><input name="productName" required className={styles.input} placeholder="e.g. Sony PlayStation 5" /></div>
          <div className={styles.row}>
            <div className={styles.field}><label className={styles.label}>Size / Variant</label><input name="size" className={styles.input} placeholder="e.g. 10, 256GB, or N/A" /></div>
            <div className={styles.field}><label className={styles.label}>Marketplace</label>
              <select name="marketplace" required className={styles.input}>
                <option value="EBAY">eBay</option>
                <option value="AMAZON">Amazon</option>
                <option value="MERCARI">Mercari</option>
                <option value="POSHMARK">Poshmark</option>
                <option value="FACEBOOK">Facebook Marketplace</option>
                <option value="DEPOP">Depop</option>
                <option value="GRAILED">Grailed</option>
                <option value="OFFERUP">OfferUp</option>
                <option value="SHOPIFY">Shopify</option>
                <option value="STOCKX">StockX</option>
                <option value="GOAT">GOAT</option>
                <option value="FLIGHTCLUB">Flight Club</option>
                <option value="STADIUMGOODS">Stadium Goods</option>
                <option value="IN_PERSON">In Person</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}><label className={styles.label}>Target Price *</label><input name="targetPrice" required className={styles.input} type="number" placeholder="500" /></div>
            <div className={styles.field}>
              <label className={styles.label}>Direction</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}><input type="radio" name="direction" value="ABOVE" defaultChecked style={{ accentColor: "var(--color-primary)" }} /> Above</label>
                <label className={styles.radioLabel}><input type="radio" name="direction" value="BELOW" style={{ accentColor: "var(--color-primary)" }} /> Below</label>
              </div>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Notify via</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}><input type="radio" name="channel" value="EMAIL" defaultChecked style={{ accentColor: "var(--color-primary)" }} /> Email</label>
              <label className={styles.radioLabel}><input type="radio" name="channel" value="SMS" style={{ accentColor: "var(--color-primary)" }} /> SMS</label>
              <label className={styles.radioLabel}><input type="radio" name="channel" value="PUSH" style={{ accentColor: "var(--color-primary)" }} /> Push</label>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" className={styles.createBtn}>Create Alert</button>
        </div>
      </Form>
    </div>
  );
}
