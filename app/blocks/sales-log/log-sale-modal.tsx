import { useState, useEffect } from "react";
import { Form } from "react-router";
import { IconX } from "@tabler/icons-react";
import styles from "./log-sale-modal.module.css";

interface Props { className?: string; onClose: () => void; inventory?: any[]; sale?: any; }

export function LogSaleModal({ className, onClose, inventory = [], sale, }: Props) {
  const [salePrice, setSalePrice] = useState(
  sale ? sale.salePrice.toString() : ""
);

const [selectedItemId, setSelectedItemId] = useState(
  sale ? sale.inventoryItemId : ""
);

const [saleDate, setSaleDate] = useState(
  sale
    ? new Date(sale.saleDate).toISOString().split("T")[0]
    : ""
);


useEffect(() => {
  if (sale) {
    setSelectedItemId(sale.inventoryItemId);
    setSalePrice(sale.salePrice.toString());
    setSaleDate(new Date(sale.saleDate).toISOString().split("T")[0]);
  }
}, [sale]);

  const selectedItem = sale
  ? sale.inventoryItem
  : inventory.find(i => i.id === selectedItemId);
  const purchasePrice = selectedItem ? Number(selectedItem.purchasePrice): 0;
  const profit = salePrice && selectedItem ? parseFloat(salePrice) - purchasePrice : null;

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={[styles.modal, className].filter(Boolean).join(" ")}>
        <div className={styles.header}>
          <span className={styles.title}>{sale ? "Edit Sale" : "Log Sale"}</span>
          <button className={styles.closeBtn} onClick={onClose}><IconX size={18} /></button>
        </div>
        <Form method="post" onSubmit={() => onClose()}>
          <input type="hidden" name="intent" value={sale ? "edit" : "create"} />  {sale && (<input type="hidden" name="saleId"value={sale.id}
  />
)}
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label}>Inventory Item *</label>
              <select name="inventoryItemId" className={styles.input} required value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} disabled={!!sale}>
                <option value="">Select an item...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.size}) - ${item.purchasePrice.toString()}</option>
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
              <input name="saleDate" className={styles.input} type="date" required value={saleDate} onChange={e => setSaleDate(e.target.value)} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Marketplace *</label>
              <select name="marketplace" className={styles.input} required>
                <option value="STOCKX">StockX</option>
                <option value="GOAT">GOAT</option>
                <option value="EBAY">eBay</option>
                <option value="FLIGHTCLUB">Flight Club</option>
                <option value="STADIUMGOODS">Stadium Goods</option>
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
            <button
            type="submit"
           className={styles.saveBtn}
           disabled={!selectedItemId || !salePrice}
             >
          {sale ? "Save Changes" : "Log Sale"}
          </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
