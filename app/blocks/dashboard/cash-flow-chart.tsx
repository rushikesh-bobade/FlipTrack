import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./cash-flow-chart.module.css";

interface Props { 
  className?: string; 
  chartData: { month: string; revenue: number; expenses: number }[];
}

export function CashFlowChart({ className, chartData = [] }: Props) {

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.header}>
        <span className={styles.title}>Cash Flow (Last 6 Months)</span>
        <div className={styles.legend}>
          <div className={styles.legendItem}><div className={styles.dot} style={{ background: "var(--color-success)" }} />Revenue</div>
          <div className={styles.legendItem}><div className={styles.dot} style={{ background: "var(--color-danger)" }} />Costs & Expenses</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fill: "var(--color-text-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--color-text-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-text)", fontSize: 12 }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
          />
          <Area type="monotone" dataKey="revenue" stroke="var(--color-success)" fill="rgba(0,255,136,0.1)" strokeWidth={2} />
          <Area type="monotone" dataKey="expenses" stroke="var(--color-danger)" fill="rgba(255,77,106,0.1)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
