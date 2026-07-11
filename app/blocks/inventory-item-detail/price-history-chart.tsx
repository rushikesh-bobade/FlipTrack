import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./price-history-chart.module.css";

import type { MarketPrice } from "@prisma/client";

type PriceHistoryItem = Pick<
  MarketPrice,
  "marketplace" | "fetchedAt"
> & {
  askPrice: number | null;
  bidPrice: number | null;
  lastSold: number | null;
};

interface Props {
  className?: string;
  priceHistory: PriceHistoryItem[];
}


const marketplaceColors: Record<string, string> = {
  stockx: "#00FF88",
  goat: "#7C3AED",
  ebay: "#3B82F6",
  flightclub: "#FFB347",
  stadiumgoods: "#FF4D6A",
};

export function PriceHistoryChart({
  className,
  priceHistory,
}: Props) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className={[styles.card, className].filter(Boolean).join(" ")}>
        <div className={styles.title}>30-Day Price History</div>
        <p>No price history available.</p>
      </div>
    );
  }

  const groupedData: Record<string, any> = {};

  priceHistory.forEach((record) => {
    const d = new Date(record.fetchedAt);

    const dateStr = `${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;

    if (!groupedData[dateStr]) {
      groupedData[dateStr] = {
        date: dateStr,
        _sortTime: d.getTime(),
      };
    }

    const marketKey = record.marketplace.toLowerCase();

    groupedData[dateStr][marketKey] =
      record.askPrice ??
      record.lastSold ??
      record.bidPrice;
  });

  const chartData = Object.values(groupedData).sort(
  (a,b) => a._sortTime - b._sortTime
);

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>30-Day Price History</div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
          />

          <XAxis
            dataKey="date"
            tick={{
              fill: "var(--color-text-subtle)",
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fill: "var(--color-text-subtle)",
              fontSize: 11,
            }}
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
          />

          <Legend wrapperStyle={{ fontSize: 11 }} />

          {Object.entries(marketplaceColors).map(([key, color]) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}