import styles from "./report-preview.module.css";

interface SaleItem {
  id: string;
  item: string;
  salePrice: number;
  marketplace: string;
  date: string;
  profit: number;
  margin: number;
}

interface ExpenseItem {
  id: string;
  amount: number;
  description: string | null;
  type: string;
  date: string;
}

interface Props {
  className?: string;
  sales: SaleItem[];
  expenses: ExpenseItem[];
}

export function ReportPreview({ className, sales }: Props) {
  const totalProceeds = sales.reduce((s, sale) => s + sale.salePrice, 0);
  const totalGains = sales.reduce((s, sale) => s + sale.profit, 0);

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.header}>
        <div className={styles.title}>Preview — Tax Year 2024</div>
        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}><div className={styles.summaryLabel}>Total Proceeds</div><div className={styles.summaryValue}>${totalProceeds.toLocaleString()}</div></div>
          <div className={styles.summaryCard}><div className={styles.summaryLabel}>Total Cost Basis</div><div className={styles.summaryValue}>${(totalProceeds - totalGains).toLocaleString()}</div></div>
          <div className={styles.summaryCard}><div className={styles.summaryLabel}>Net Capital Gains</div><div className={[styles.summaryValue, styles.positive].join(" ")}>${totalGains.toLocaleString()}</div></div>
        </div>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Item</th>
              <th className={styles.th}>Proceeds</th>
              <th className={styles.th}>Cost Basis</th>
              <th className={styles.th}>Gain/Loss</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(s => (
              <tr key={s.id} className={styles.tr}>
                <td className={styles.td}>{s.date}</td>
                <td className={styles.td}>{s.item}</td>
                <td className={styles.td}><span className={styles.mono}>${s.salePrice}</span></td>
                <td className={styles.td}><span className={styles.mono}>${s.salePrice - s.profit}</span></td>
                <td className={styles.td}><span className={[styles.mono, s.profit >= 0 ? styles.positive : styles.negative].join(" ")}>{s.profit >= 0 ? "+" : ""}${s.profit}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
