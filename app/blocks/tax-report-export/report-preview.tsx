import styles from "./report-preview.module.css";

interface SaleRow {
  id: string;
  saleDate: string | Date;
  salePrice: number;
  inventoryItem: {
    name: string;
    sku: string;
    purchasePrice: number;
  };
}

interface ExpenseRow {
  id: string;
  date: string | Date;
  description: string | null;
  type: string;
  amount: number;
}

interface Props {
  sales: SaleRow[];
  expenses: ExpenseRow[];
  taxYear: number;
  className?: string;
}

export function ReportPreview({ sales, expenses, taxYear, className }: Props) {
  const totalProceeds = sales.reduce((s, sale) => s + sale.salePrice, 0);
  const totalCostBasis = sales.reduce(
    (s, sale) => s + sale.inventoryItem.purchasePrice,
    0
  );
  const totalGains = totalProceeds - totalCostBasis;
  const totalExpenses = expenses.reduce((s, exp) => s + exp.amount, 0);

  const formatDate = (d: string | Date) =>
    new Date(d).toISOString().split("T")[0];

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.header}>
        <div className={styles.title}>Preview — Tax Year {taxYear}</div>
        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Proceeds</div>
            <div className={styles.summaryValue}>
              ${totalProceeds.toLocaleString()}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Cost Basis</div>
            <div className={styles.summaryValue}>
              ${totalCostBasis.toLocaleString()}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Net Capital Gains</div>
            <div
              className={[
                styles.summaryValue,
                totalGains >= 0 ? styles.positive : styles.negative,
              ].join(" ")}
            >
              {totalGains >= 0 ? "+" : ""}${totalGains.toLocaleString()}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Deductible Expenses</div>
            <div className={[styles.summaryValue, styles.negative].join(" ")}>
              -${totalExpenses.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {sales.length === 0 && expenses.length === 0 ? (
        <div
          style={{
            padding: "var(--space-8)",
            textAlign: "center",
            color: "var(--color-text-subtle)",
            fontSize: 14,
          }}
        >
          No sales or expenses recorded for {taxYear}.
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Type</th>
                <th className={styles.th}>Item / Description</th>
                <th className={styles.th}>Proceeds</th>
                <th className={styles.th}>Cost Basis</th>
                <th className={styles.th}>Gain / Loss</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const gain = s.salePrice - s.inventoryItem.purchasePrice;
                return (
                  <tr key={s.id} className={styles.tr}>
                    <td className={styles.td}>{formatDate(s.saleDate)}</td>
                    <td className={styles.td}>Sale</td>
                    <td className={styles.td}>
                      {s.inventoryItem.name}{" "}
                      <span style={{ color: "var(--color-text-subtle)" }}>
                        ({s.inventoryItem.sku})
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.mono}>${s.salePrice}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.mono}>
                        ${s.inventoryItem.purchasePrice}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={[
                          styles.mono,
                          gain >= 0 ? styles.positive : styles.negative,
                        ].join(" ")}
                      >
                        {gain >= 0 ? "+" : ""}${gain}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {expenses.map((e) => (
                <tr key={e.id} className={styles.tr}>
                  <td className={styles.td}>{formatDate(e.date)}</td>
                  <td className={styles.td}>Expense</td>
                  <td className={styles.td}>
                    {e.description || e.type}{" "}
                    <span style={{ color: "var(--color-text-subtle)" }}>
                      ({e.type})
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.mono}>—</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.mono}>—</span>
                  </td>
                  <td className={styles.td}>
                    <span className={[styles.mono, styles.negative].join(" ")}>
                      -${e.amount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
