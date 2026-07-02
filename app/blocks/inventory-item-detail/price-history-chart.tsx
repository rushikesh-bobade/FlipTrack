import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { MarketPrice } from "@prisma/client";
import styles from "./price-history-chart.module.css";

interface Props {
  className?: string;
  priceHistory: (Pick<MarketPrice, "marketplace"> & {
    fetchedAt: string | Date;
    askPrice: number | null;
    bidPrice: number | null;
    lastSold: number | null;
  })[];
}

const marketplaceColors: Record<string, string> = {
  stockx: "#00FF88",
  goat: "#7C3AED",
  ebay: "#3B82F6",
  flightclub: "#FFB347",
  stadiumgoods: "#FF4D6A",
};

export function PriceHistoryChart({ className, priceHistory }: Props) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className={[styles.card, className].filter(Boolean).join(" ")}>
        <div className={styles.title}>30-Day Price History</div>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-muted)",
            textAlign: "center",
            padding: "var(--space-6)",
            margin: 0,
          }}
        >
          No price history available.
        </p>
      </div>
    );
  }

  const groupedData: Record<string, any> = {};

  priceHistory.forEach((record) => {
    const d = new Date(record.fetchedAt);
    const dateStr = `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
    const sortKey = d.getTime();

    if (!groupedData[dateStr]) {
      groupedData[dateStr] = { date: dateStr, _sortTime: sortKey };
    }

    const marketKey = record.marketplace.toLowerCase();
    const price = record.lastSold ?? record.askPrice ?? record.bidPrice;
    if (price !== null) {
      groupedData[dateStr][marketKey] = price;
    }
  });

  const chartData = Object.values(groupedData).sort((a, b) => a._sortTime - b._sortTime);

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>30-Day Price History</div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--color-text-subtle)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-text-subtle)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => [`${Number(v)}`, ""]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {Object.entries(marketplaceColors).map(([key, color]) => (
            <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
