import styles from "./StaleInventoryCard.module.css";

interface Props {
  className?: string;
  items?: any[];
}

export function StaleInventoryCard({ className, items = [] }: Props) {
  const totalTiedUpCapital = items.reduce((acc, i) => acc + Number(i.purchasePrice), 0);
  const maxDays = Math.max(...items.map((i) => i.daysInStock), 1);

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Stale Inventory</h2>
        <span className={styles.badge}>{items.length} items &bull; 60+ days</span>
      </div>
      <div className={styles.sub}>${totalTiedUpCapital.toFixed(2)} in capital tied up</div>

      {items.length === 0 ? (
        <div className={styles.empty}>Nothing stale — everything is moving.</div>
      ) : (
        <div className={styles.list}>
          {items.slice(0, 8).map((item) => (
            <div key={item.id} className={styles.row}>
              <div className={styles.rowInfo}>
                <span className={styles.itemName}>
                  {item.name} {item.size ? `(${item.size})` : ""}
                </span>
                <span className={styles.itemMeta}>
                  {item.sku} &bull; {item.daysInStock} days in stock
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.min((item.daysInStock / maxDays) * 100, 100)}%` }}
                />
              </div>
              <span className={styles.itemValue}>${Number(item.purchasePrice).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
