import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockCashFlow } from "~/data/mock-data";
import styles from "./monthly-breakdown-chart.module.css";

interface Props { className?: string; sales?: any[]; expenses?: any[]; }

export function MonthlyBreakdownChart({ className, sales = [], expenses = [] }: Props) {
  // Group by month
  const grouped: Record<string, { revenue: number, expenses: number, profit: number }> = {};

  // Last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString('default', { month: 'short' });
    grouped[label] = { revenue: 0, expenses: 0, profit: 0 };
  }

  sales.forEach(s => {
    const d = new Date(s.saleDate);
    const label = d.toLocaleString('default', { month: 'short' });
    if (grouped[label]) {
      grouped[label].revenue += Number(s.salePrice);
      grouped[label].expenses +=
        Number(s.inventoryItem.purchasePrice) +
        Number(s.platformFee) +
        Number(s.shippingCost);
    }
  });

  expenses.forEach(e => {
    const d = new Date(e.date);
    const label = d.toLocaleString('default', { month: 'short' });
    if (grouped[label]) {
      grouped[label].expenses += Number(e.amount);
    }
  });

  const data = Object.keys(grouped).map(month => ({
    month,
    revenue: grouped[month].revenue,
    expenses: grouped[month].expenses,
    profit: grouped[month].revenue - grouped[month].expenses
  }));
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Monthly Breakdown</div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fill: "var(--color-text-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--color-text-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${Number(v).toLocaleString()}`, ""]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="revenue" fill="var(--color-success)" radius={[2, 2, 0, 0]} fillOpacity={0.8} />
          <Bar dataKey="expenses" fill="var(--color-danger)" radius={[2, 2, 0, 0]} fillOpacity={0.8} />
          <Bar dataKey="profit" fill="var(--color-info)" radius={[2, 2, 0, 0]} fillOpacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
