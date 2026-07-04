import styles from "./price-alerts-quick-add.module.css";

interface Props { className?: string; }

export function PriceAlertsQuickAdd({ className }: Props) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Quick Create Price Alert</div>
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Item</label>
          <select className={styles.input}>
            <option>Air Jordan 1 Chicago</option>
            <option>Yeezy 350 Zebra</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Marketplace</label>
          <select className={styles.input}>
            <option>StockX</option><option>GOAT</option><option>eBay</option><option>Flight Club</option><option>Stadium Goods</option><option>Amazon</option><option>Mercari</option><option>Poshmark</option><option>Facebook</option><option>Shopify</option><option>Grailed</option><option>Depop</option><option>OfferUp</option><option>Other</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Target Price</label>
          <input className={styles.input} type="number" placeholder="500" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Direction</label>
          <select className={styles.input}><option>Above</option><option>Below</option></select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Notify via</label>
          <select className={styles.input}><option>Email</option><option>SMS</option><option>Push</option></select>
        </div>
        <button className={styles.createBtn}>Create Alert</button>
      </div>
    </div>
  );
}
