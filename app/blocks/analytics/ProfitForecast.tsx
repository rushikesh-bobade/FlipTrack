import styles from "./ProfitForecast.module.css";

interface Props {
  className?: string;
  forecast?: {
    totalInventoryCost: number;
    totalEstimatedMarketValue: number;
    projectedProfit: number;
    projectedMarginPct: number;
    itemsMissingMarketData: number;
  };
}

export function ProfitForecast({ className, forecast }: Props) {
  if (!forecast) return null;
  const isProfit = forecast.projectedProfit >= 0;

  const cards = [
    { label: "Inventory Cost", value: `$${forecast.totalInventoryCost.toFixed(2)}`, sub: "All in-stock items" },
    {
      label: "Est. Market Value",
      value: `$${forecast.totalEstimatedMarketValue.toFixed(2)}`,
      sub: "Based on latest price data",
    },
    {
      label: "Projected Profit",
      value: `${isProfit ? "+" : ""}$${forecast.projectedProfit.toFixed(2)} (${forecast.projectedMarginPct.toFixed(1)}%)`,
      sub: "If sold at current market value",
      positive: isProfit,
    },
  ];

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <h2 className={styles.title}>Profit Forecast</h2>
      <div className={styles.row}>
        {cards.map((c) => (
          <div key={c.label} className={styles.statCard}>
            <div className={styles.label}>{c.label}</div>
            <div className={[styles.value, c.positive ? styles.positive : ""].join(" ")}>{c.value}</div>
            <div className={styles.sub}>{c.sub}</div>
          </div>
        ))}
      </div>
      {forecast.itemsMissingMarketData > 0 && (
        <div className={styles.disclaimer}>
          {forecast.itemsMissingMarketData} item(s) had no scraped market price yet — purchase or asking price was used
          as a placeholder.
        </div>
      )}
    </div>
  );
}
