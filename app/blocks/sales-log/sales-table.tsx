import styles from "./sales-table.module.css";

interface Props { className?: string; sales?: any[]; }

export function SalesTable({ className, sales = [] }: Props) {
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Item</th>
              <th className={styles.th}>Marketplace</th>
              <th className={styles.th}>Sale Price</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Margin</th>
              <th className={styles.th}>Profit</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(s => {
              const salePrice = Number(s.salePrice);
              const cost = Number(s.inventoryItem.purchasePrice);
              const platformFee = Number(s.platformFee);
              const shippingCost = Number(s.shippingCost);
              const profit = salePrice - cost - platformFee - shippingCost;
              const margin = salePrice > 0 ? ((profit / salePrice) * 100).toFixed(1) : 0;
              const dateObj = new Date(s.saleDate);

              return (
                <tr key={s.id} className={styles.tr}>
                  <td className={styles.td}>{s.inventoryItem.name}</td>
                  <td className={styles.td}>{s.marketplace}</td>
                  <td className={styles.td}>${salePrice.toFixed(2)}</td>
                  <td className={styles.td}>{dateObj.toLocaleDateString()}</td>
                  <td className={styles.td}>{margin}%</td>
                  <td className={styles.td}>
                    <span className={[styles.profitBadge, profit >= 0 ? styles.positive : styles.negative].join(" ")}>
                      {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
