import { IconRefresh } from "@tabler/icons-react";
import styles from "./market-prices-header.module.css";

interface Props { className?: string; }

const marketplaces = ["StockX", "GOAT", "eBay", "Flight Club", "Stadium Goods", "Amazon", "Mercari", "Poshmark", "Facebook", "Shopify", "Grailed", "Depop", "OfferUp"];

export function MarketPricesHeader({ className }: Props) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      <h1 className={styles.title}>Market Prices</h1>
      <div className={styles.controls}>
        {marketplaces.map(m => (
          <label key={m} className={styles.checkboxLabel}>
            <input type="checkbox" defaultChecked style={{ accentColor: "var(--color-primary)" }} />
            {m}
          </label>
        ))}
        <button className={styles.refreshBtn}><IconRefresh size={14} /> Refresh</button>
      </div>
    </div>
  );
}
