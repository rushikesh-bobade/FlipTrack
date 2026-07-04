import { useState, useEffect } from "react";
import { Form } from "react-router";
import { IconX } from "@tabler/icons-react";
import styles from "./log-sale-modal.module.css";

interface Props { className?: string; onClose: () => void; }

export function LogSaleModal({ className, onClose }: Props) {
  const [salePrice, setSalePrice] = useState("");
  const [platformFee, setPlatformFee] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  useEffect(() => {
    if (search.length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/inventory/search?q=${search}`)
        .then(res => res.json())
        .then(data => setSearchResults(data.items || []))
        .catch(err => console.error(err));
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const purchasePrice = selectedItem ? Number(selectedItem.purchasePrice) : 0;
  const platformFeeValue = parseFloat(platformFee || "0");
  const shippingCostValue = parseFloat(shippingCost || "0");
  const profit = salePrice && selectedItem ? parseFloat(salePrice) - purchasePrice - platformFeeValue - shippingCostValue : null;

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
            <div className={styles.field} style={{ position: 'relative' }}>
              <label className={styles.label}>Search Inventory Item *</label>
              <input 
                className={styles.input} 
                placeholder="Type SKU or name..." 
                value={search} 
                onChange={e => { setSearch(e.target.value); setSelectedItem(null); setSelectedItemId(""); }} 
                required={!selectedItemId}
              />
              {searchResults.length > 0 && !selectedItem && (
                <ul className={styles.autocompleteList} style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: '#fff', border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto', padding: 0, listStyle: 'none' }}>
                  {searchResults.map(item => (
                    <li 
                      key={item.id} 
                      style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#000' }}
                      onClick={() => {
                        setSelectedItem(item);
                        setSelectedItemId(item.id);
                        setSearchResults([]);
                        setSearch(`${item.name} (${item.size}) - $${Number(item.purchasePrice)}`);
                      }}
                    >
                      {item.name} ({item.size}) - ${Number(item.purchasePrice)}
                    </li>
                  ))}
                </ul>
              )}
              <input type="hidden" name="inventoryItemId" value={selectedItemId} required />
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
                <label className={styles.label}>Platform / Seller Fees</label>
                <input name="platformFee" type="number" step="0.01" min="0" inputMode="decimal" className={styles.input} placeholder="0.00" value={platformFee} onChange={e => setPlatformFee(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Shipping Cost</label>
                <input name="shippingCost" type="number" step="0.01" min="0" inputMode="decimal" className={styles.input} placeholder="0.00" value={shippingCost} onChange={e => setShippingCost(e.target.value)} />
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
      </div >
    </div >
  );
}
