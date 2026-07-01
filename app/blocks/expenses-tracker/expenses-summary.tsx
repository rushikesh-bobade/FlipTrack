import styles from "./expenses-summary.module.css";

interface Props { 
  className?: string; 
  expenses?: any[]; 
  recurring?: any[]; 
  oneTimeTotal?: number;
}

export function ExpensesSummary({ className, expenses = [], recurring = [], oneTimeTotal }: Props) {
  const oneTimeSum = typeof oneTimeTotal === "number"
    ? oneTimeTotal
    : expenses.reduce((acc, e) => acc + Number(e.amount), 0);

  let totalExpenses = oneTimeSum;
  recurring.forEach(r => {
    if (r.isActive) totalExpenses += Number(r.amount);
  });

  const cards = [
    { label: "Total Expenses", value: `$${totalExpenses.toFixed(2)}`, sub: "All time" },
    { label: "Recurring Monthly", value: `$${recurring.filter(r => r.isActive).reduce((acc, r) => acc + Number(r.amount), 0).toFixed(2)}`, sub: "Active subscriptions" },
    { label: "One-Time Expenses", value: `$${oneTimeSum.toFixed(2)}`, sub: "Logged purchases" },
  ];

  return (
    <div className={[styles.row, className].filter(Boolean).join(" ")}>
      {cards.map(c => (
        <div key={c.label} className={styles.card}>
          <div className={styles.label}>{c.label}</div>
          <div className={styles.value}>{c.value}</div>
          <div className={styles.sub}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
