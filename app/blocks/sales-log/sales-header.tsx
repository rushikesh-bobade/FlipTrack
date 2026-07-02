import { IconPlus } from "@tabler/icons-react";
import styles from "./sales-header.module.css";

interface Props { className?: string; onLogSale?: () => void; }

export function SalesHeader({ className, onLogSale }: Props) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      <div className={styles.left}>
        <h1 className={styles.title}>Sales</h1>
        <div className={styles.meta}>5 sales &bull; $1,345 total revenue this month</div>
      </div>
      <div className={styles.controls}>
        <select className={styles.select}><option>This Month</option><option>Last 3 Months</option><option>Last Year</option></select>
        <select className={styles.select}><option>All Marketplaces</option><option>StockX</option><option>GOAT</option><option>eBay</option><option>Amazon</option><option>Mercari</option><option>Poshmark</option><option>Facebook</option><option>Depop</option><option>Grailed</option><option>OfferUp</option><option>Shopify</option><option>Flight Club</option><option>Stadium Goods</option><option>In Person</option><option>Other</option></select>
        <button className={styles.btn} onClick={onLogSale}><IconPlus size={14} /> Log Sale</button>
      </div>
    </div>
  );
}
