import { mockSales } from "~/data/mock-data";
import styles from "./detailed-statement-table.module.css";

interface Props { className?: string; sales?: any[]; expenses?: any[]; }

export function DetailedStatementTable({ className, sales = [], expenses = [] }: Props) {
  // Compute expenses related to specific sales (if expenses had saleId, but for now we distribute or just list sales)
  // Let's just list the Sales and associate an estimated expense or just leave it empty.
  // Actually, wait, expenses has a saleId sometimes.
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Detailed Statement</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Item</th>
              <th className={styles.th}>Sale Price</th>
              <th className={styles.th}>COGS</th>
              <th className={styles.th}>Gross Profit</th>
              <th className={styles.th}>Direct Expenses</th>
              <th className={styles.th}>Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(s => {
              const cogs = Number(s.inventoryItem.purchasePrice);
              const platformFee = Number(s.platformFee);
              const shippingCost = Number(s.shippingCost);
              
              const gross = Number(s.salePrice) - cogs - platformFee - shippingCost;
              // Sum expenses related to this sale if they exist
              const saleExpenses = expenses.filter(e => e.saleId === s.id).reduce((acc, e) => acc + Number(e.amount), 0);
              const profit = gross - saleExpenses;

              return (
                <tr key={s.id} className={styles.tr}>
                  <td className={styles.td}>{new Date(s.saleDate).toLocaleDateString()}</td>
                  <td className={styles.td}>{s.inventoryItem.name}</td>
                  <td className={styles.td}><span className={styles.mono}>${Number(s.salePrice).toLocaleString()}</span></td>
                  <td className={styles.td}><span className={styles.mono}>${cogs.toLocaleString()}</span></td>
                  <td className={styles.td}><span className={[styles.mono, gross >= 0 ? styles.positive : styles.negative].join(" ")}>${gross.toLocaleString()}</span></td>
                  <td className={styles.td}><span className={styles.mono}>${saleExpenses.toLocaleString()}</span></td>
                  <td className={styles.td}><span className={[styles.mono, profit >= 0 ? styles.positive : styles.negative].join(" ")}>${profit.toLocaleString()}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
