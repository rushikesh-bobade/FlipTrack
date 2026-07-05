import { Link } from "react-router";
import styles from "./top-selling-items-table.module.css";

interface Props { className?: string; sales?: any[]; }

export function TopSellingItemsTable({ className, sales = [] }: Props) {
  const itemStats: Record<string, { id: string, name: string, sold: number, profit: number, revenue: number }> = {};

  sales.forEach(s => {
    const sku = s.inventoryItem.sku;
    const profit = Number(s.salePrice) - Number(s.inventoryItem.purchasePrice) - Number(s.platformFee) - Number(s.shippingCost);
    if (!itemStats[sku]) {
      itemStats[sku] = { id: s.inventoryItem.id, name: s.inventoryItem.name, sold: 0, profit: 0, revenue: 0 };
    }
    itemStats[sku].sold++;
    itemStats[sku].profit += profit;
    itemStats[sku].revenue += Number(s.salePrice);
  });

  const chartData = Object.values(itemStats)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  if (chartData.length === 0) {
    return <div className={[styles.card, className].filter(Boolean).join(" ")}><div className={styles.header}><span className={styles.title}>Top Selling Items</span></div><p style={{ padding: '1rem', color: 'var(--color-text-subtle)' }}>No sales logged yet.</p></div>;
  }

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.header}><span className={styles.title}>Top Selling Items</span></div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Product</th>
            <th className={[styles.th, styles.right].join(" ")}>Times Sold</th>
            <th className={[styles.th, styles.right].join(" ")}>Avg Margin</th>
            <th className={[styles.th, styles.right].join(" ")}>Total Profit</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((item, i) => (
            <tr key={i}>
              <td className={styles.td}><Link to={`/app/inventory/${item.id}`} className={styles.link}>{item.name}</Link></td>
              <td className={[styles.td, styles.right].join(" ")}>{item.sold}</td>
              <td className={[styles.td, styles.right].join(" ")}>{((item.profit / item.revenue) * 100).toFixed(1)}%</td>
              <td className={styles.profit}>${item.profit.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
