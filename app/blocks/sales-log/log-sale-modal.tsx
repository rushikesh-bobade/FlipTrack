import { useState } from "react";
import { Form } from "react-router";
import { IconX } from "@tabler/icons-react";
import styles from "./log-sale-modal.module.css";

interface Props { className?: string; onClose: () => void; inventory?: any[]; }

export function LogSaleModal({ className, onClose, inventory = [] }: Props) {
  const [salePrice, setSalePrice] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  
  const selectedItem = inventory.find(i => i.id === selectedItemId);
  const purchasePrice = selectedItem ? Number(selectedItem.purchasePrice) : 0;
  const profit = salePrice && selectedItem ? parseFloat(salePrice) - purchasePrice : null;

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={[styles.modal, className].filter(Boolean).join(" ")}>
        <div className={styles.header}>
          <span className={styles.title}>Log Sale</span>
          <button className={styles.closeBtn} onClick={onClose}><IconX size={18} /></button>
        </div>
        <Form method="post" onSubmit={() => onClose()}>
          <input type="hidden" name="intent" value="create" />
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label}>Inventory Item *</label>
              <select name="inventoryItemId" className={styles.input} required value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)}>
                <option value="">Select an item...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.size}) - ${Number(item.purchasePrice)}</option>
                ))}
              </select>
            </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Sale Price *</label>
              <input name="salePrice" className={styles.input} type="number" step="0.01" placeholder="450" required value={salePrice} onChange={e => setSalePrice(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Sale Date *</label>
              <input name="saleDate" className={styles.input} type="date" required />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Marketplace *</label>
              <select name="marketplace" className={styles.input} required>
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
            <div className={styles.field}>
              <label className={styles.label}>Tracking Number</label>
              <input name="trackingNumber" className={styles.input} placeholder="Optional" />
            </div>
          </div>
          {profit !== null && (
            <div className={styles.profitPreview}>
              <div className={styles.profitLabel}>Estimated Net Profit</div>
              <div className={styles.profitValue}>{profit >= 0 ? "+" : ""}${profit.toFixed(2)}</div>
            </div>
          )}
          </div>
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={!selectedItemId || !salePrice}>Log Sale</button>
          </div>
        </Form>
      </div>
    </div>
  );
}
