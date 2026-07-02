import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import styles from "./expense-categories-chart.module.css";

interface Props {
  expenses: {
    type: string;
    amount: number;
  }[];
}

const COLORS = {
  SHIPPING: "var(--color-primary)",
  MARKETPLACE_FEE: "var(--color-secondary)",
  BOT_FEE: "var(--color-danger)",
  SUPPLIES: "var(--color-success)",
  OTHER: "var(--color-surface-border)",
  CUSTOM: "var(--color-foreground-muted)",
};

export function ExpenseCategoriesChart({ expenses }: Props) {
  // Aggregate expenses by type
  const aggregated = expenses.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(aggregated)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Expenses Breakdown</h3>
        </div>
        <div className={styles.emptyState}>No expenses to display</div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Expenses Breakdown</h3>
      </div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.OTHER} 
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Amount"]}
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-surface-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-foreground)",
              }}
              itemStyle={{ color: "var(--color-foreground)" }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
