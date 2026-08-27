import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./sales-by-marketplace-pie.module.css";

interface Props { 
  className?: string; 
  chartData: { name: string; value: number; color?: string }[];
}

const COLORS = ["#4a90e2", "#3ECF8E", "#f5a623", "#f87171", "#a78bfa", "#94a3b8"];

export function SalesByMarketplacePie({ className, chartData = [] }: Props) {
  // Apply colors if not provided
  const data = chartData.map((item, i) => ({
    ...item,
    color: item.color || COLORS[i % COLORS.length]
  }));

  if (data.length === 0) {
    data.push({ name: "No Sales", value: 100, color: COLORS[5] });
  }

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Sales by Marketplace</div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-text)", fontSize: 12 }}
            formatter={(v) => [`${Number(v)}%`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div>
        {data.map(item => (
          <div key={item.name} className={styles.legendItem}>
            <div className={styles.dot} style={{ background: item.color }} />
            {item.name} &mdash; {item.value}%
          </div>
        ))}
      </div>
    </div>
  );
}
