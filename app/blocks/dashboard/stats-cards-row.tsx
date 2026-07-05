import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import styles from "./stats-cards-row.module.css";

interface Props { className?: string; stats?: any; sales?: any[]; expenses?: any[]; }

export function StatsCardsRow({ className, stats, sales = [], expenses = [] }: Props) {
  const portfolioValue = stats?._sum?.purchasePrice ? Number(stats._sum.purchasePrice) : 0;
  
  let totalRevenue = 0;
  let totalCostOfSold = 0;
  sales.forEach(s => {
    totalRevenue += Number(s.salePrice);
    totalCostOfSold += Number(s.inventoryItem.purchasePrice) + Number(s.platformFee) + Number(s.shippingCost);
  });
  
  let totalExpenses = 0;
  expenses.forEach(e => totalExpenses += Number(e.amount));
  
  const netProfit = totalRevenue - totalCostOfSold - totalExpenses;

  const displayStats = [
    { label: "Portfolio Value", value: `$${portfolioValue.toLocaleString()}`, change: "+0%", positive: true, bars: [60,70,55,80,65,90,75] },
    { label: "Inventory Count", value: `${stats?._count || 0} items`, change: "+0%", positive: true, bars: [40,55,45,70,60,80,75] },
    { label: "Total Sales", value: `$${totalRevenue.toLocaleString()}`, change: "+0%", positive: true, bars: [50,60,70,55,80,75,90] },
    { label: "Net Profit", value: `$${netProfit.toLocaleString()}`, change: "+0%", positive: netProfit >= 0, bars: [45,60,50,75,65,80,85] },
  ];

  return (
    <div className={[styles.row, className].filter(Boolean).join(" ")}>
      {displayStats.map(s => (
        <div key={s.label} className={styles.card}>
          <div className={styles.label}>{s.label}</div>
          <div className={styles.value}>{s.value}</div>
          <div className={[styles.change, s.positive ? styles.positive : styles.negative].join(" ")}>
            {s.positive ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
            {s.change} vs last period
          </div>
          <div className={styles.sparkline}>
            {s.bars.map((h, i) => (
              <div key={i} className={styles.bar} style={{ height: `${h}%`, background: s.positive ? "var(--color-success)" : "var(--color-danger)", opacity: 0.6 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
