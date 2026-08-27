import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import styles from "./top-brands-chart.module.css";

interface Props { 
  className?: string; 
  chartData: { brand: string; profit: number }[];
}

export function TopBrandsChart({ className, chartData = [] }: Props) {

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Top Brands by Profit</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <XAxis type="number" tick={{ fill: "var(--color-text-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
          <YAxis type="category" dataKey="brand" tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
          <Tooltip
            contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-text)", fontSize: 12 }}
            formatter={(v) => [`$${Number(v).toLocaleString()}`, "Profit"]}
          />
          <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => <Cell key={i} fill={i === 0 ? "var(--color-primary)" : "var(--color-bg-hover)"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
