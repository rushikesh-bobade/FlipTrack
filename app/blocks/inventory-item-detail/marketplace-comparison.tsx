import type { MarketPrice } from "@prisma/client";
import styles from "./marketplace-comparison.module.css";

interface Props {
  className?: string;
  priceHistory: (Pick<MarketPrice, "marketplace"> & {
    fetchedAt: string | Date;
    askPrice: number | null;
    bidPrice: number | null;
    lastSold: number | null;
  })[];
}

const formatMarketplaceName = (name: string) => {
  const map: Record<string, string> = {
    stockx: "StockX",
    goat: "GOAT",
    ebay: "eBay",
    flightclub: "Flight Club",
    stadiumgoods: "Stadium Goods",
    amazon: "Amazon",
    mercari: "Mercari",
    poshmark: "Poshmark",
    facebook: "Facebook Marketplace",
    shopify: "Shopify",
    grailed: "Grailed",
    depop: "Depop",
    offerup: "OfferUp",
    in_person: "In Person",
    other: "Other",
  };
  return map[name.toLowerCase()] || name;
};

export function MarketplaceComparison({ className, priceHistory }: Props) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className={[styles.card, className].filter(Boolean).join(" ")}>
        <div className={styles.title}>Marketplace Comparison</div>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-muted)",
            textAlign: "center",
            padding: "var(--space-6)",
            margin: 0,
          }}
        >
          No marketplace data available.
        </p>
      </div>
    );
  }

  // Get the most recent record for each marketplace
  // Assuming priceHistory is already sorted by fetchedAt desc
  const latestByMarket = new Map<string, (typeof priceHistory)[0]>();
  for (const record of priceHistory) {
    const key = record.marketplace.toLowerCase();
    if (!latestByMarket.has(key)) {
      latestByMarket.set(key, record);
    }
  }

  const latestRecords = Array.from(latestByMarket.values());

  // Determine the best marketplace to sell on (highest bidPrice, fallback to lastSold)
  let bestMarketplace = "";
  let highestValue = -1;
  latestRecords.forEach((record) => {
    const val = record.bidPrice ?? record.lastSold ?? 0;
    if (val > highestValue) {
      highestValue = val;
      bestMarketplace = record.marketplace;
    }
  });

  const data = latestRecords
    .map((record) => ({
      name: formatMarketplaceName(record.marketplace),
      ask: record.askPrice,
      lastSold: record.lastSold,
      bid: record.bidPrice,
      best: record.marketplace === bestMarketplace && highestValue > 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Marketplace Comparison</div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Marketplace</th>
            <th className={styles.th}>Ask Price</th>
            <th className={styles.th}>Last Sold</th>
            <th className={styles.th}>Bid Price</th>
            <th className={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.name}>
              <td className={styles.td}>{d.name}</td>
              <td className={styles.td}>
                {d.ask ? (
                  <span className={styles.mono}>${d.ask}</span>
                ) : (
                  <span style={{ color: "var(--color-text-subtle)" }}>N/A</span>
                )}
              </td>
              <td className={styles.td}>
                {d.lastSold ? (
                  <span className={styles.mono}>${d.lastSold}</span>
                ) : (
                  <span style={{ color: "var(--color-text-subtle)" }}>N/A</span>
                )}
              </td>
              <td className={styles.td}>
                {d.bid ? (
                  <span className={styles.mono}>${d.bid}</span>
                ) : (
                  <span style={{ color: "var(--color-text-subtle)" }}>N/A</span>
                )}
              </td>
              <td className={styles.td}>{d.best && <span className={styles.bestBadge}>Best to Sell</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
