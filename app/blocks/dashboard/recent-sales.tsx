import { Link } from "react-router";
import styles from "./recent-sales.module.css";

interface Props { className?: string; sales?: any[]; }

export function RecentSales({ className, sales = [] }: Props) {
  const recentSales = sales.slice(0, 5);

  if (recentSales.length === 0) {
    return <div className={[styles.card, className].filter(Boolean).join(" ")}><div className={styles.header}><span className={styles.title}>Recent Sales</span></div><p style={{ padding: '1rem', color: 'var(--color-text-subtle)' }}>No sales logged yet.</p></div>;
  }

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.header}>
        <span className={styles.title}>Recent Sales</span>
        <Link to="/app/sales" className={styles.viewAll}>View all</Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Item</th>
            <th className={styles.th}>Marketplace</th>
            <th className={styles.th}>Sale Price</th>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Profit</th>
          </tr>
        </thead>
        <tbody>
          {recentSales.map(s => {
            const profit = Number(s.salePrice) - Number(s.inventoryItem.purchasePrice) - Number(s.platformFee) - Number(s.shippingCost);
            return (
              <tr key={s.id}>
                <td className={styles.td}>{s.inventoryItem.name}</td>
                <td className={styles.td}>{s.marketplace}</td>
                <td className={styles.td}>${Number(s.salePrice).toFixed(2)}</td>
                <td className={styles.td}>{new Date(s.saleDate).toLocaleDateString()}</td>
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
  );
}
