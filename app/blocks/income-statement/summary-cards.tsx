import styles from "./summary-cards.module.css";

interface Props { className?: string; sales?: any[]; expenses?: any[]; }

export function SummaryCards({ className, sales = [], expenses = [] }: Props) {
  let totalRevenue = 0;
  let totalCOGS = 0;

  sales.forEach(s => {
    totalRevenue += Number(s.salePrice);
    totalCOGS +=
      Number(s.inventoryItem.purchasePrice) +
      Number(s.platformFee) +
      Number(s.shippingCost);
  });

  let totalExpenses = 0;
  expenses.forEach(e => totalExpenses += Number(e.amount));

  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;
  const roi = totalCOGS > 0 ? (netProfit / totalCOGS) * 100 : 0;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const cards = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "n/a" },
    { label: "Total COGS", value: `$${totalCOGS.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "n/a" },
    { label: "Gross Profit", value: `$${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "n/a", positive: grossProfit >= 0 },
    { label: "Net Profit", value: `$${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "n/a", positive: netProfit >= 0 },
    { label: "Total Expenses", value: `$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "n/a" },
    { label: "ROI", value: `${roi.toFixed(1)}%`, change: "n/a", positive: roi >= 0 },
    { label: "Profit Margin", value: `${margin.toFixed(1)}%`, change: "n/a", positive: margin >= 0 },
  ];

  return (
    <div className={[styles.row, className].filter(Boolean).join(" ")} style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
      {cards.slice(0, 4).map(c => (
        <div key={c.label} className={styles.card}>
          <div className={styles.label}>{c.label}</div>
          <div className={[styles.value, c.positive ? styles.positive : ""].join(" ")}>{c.value}</div>
          <div className={styles.change}>{c.change}</div>
        </div>
      ))}
    </div>
  );
}
