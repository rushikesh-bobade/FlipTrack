import { Link } from "react-router";
import styles from "./price-comparison-table.module.css";

interface Props { className?: string; prices?: any[]; }

const mpNames = ["STOCKX", "GOAT", "EBAY", "FLIGHTCLUB", "STADIUMGOODS", "AMAZON", "MERCARI", "POSHMARK", "FACEBOOK", "SHOPIFY", "GRAILED", "DEPOP", "OFFERUP", "IN_PERSON", "OTHER"];

export function PriceComparisonTable({ className, prices = [] }: Props) {
  // Group by SKU
  const grouped: Record<string, { sku: string; name: string; prices: Record<string, number> }> = {};
  
  prices.forEach(p => {
    if (!grouped[p.sku]) {
      grouped[p.sku] = { sku: p.sku, name: p.productName, prices: {} };
    }
    grouped[p.sku].prices[p.marketplace] = p.askPrice;
  });

  const skus = Object.values(grouped);

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Item</th>
              {mpNames.map(m => <th key={m} className={styles.th}>{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {skus.length === 0 ? (
              <tr><td colSpan={6} style={{padding: '1rem', color: 'var(--color-text-subtle)', textAlign: 'center'}}>No market prices available.</td></tr>
            ) : null}
            {skus.map(item => {
              const allPrices = mpNames.map(m => item.prices[m]).filter(Boolean);
              const best = Math.max(...allPrices);
              return (
                <tr key={item.sku} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.nameLink}>{item.name}</div>
                    <div className={styles.sku}>{item.sku}</div>
                  </td>
                  {mpNames.map((m) => {
                    const price = item.prices[m];
                    if (!price) return <td key={m} className={styles.td}>-</td>;
                    return (
                      <td key={m} className={styles.td}>
                        <span className={[styles.priceCell, styles.profit].join(" ")}>${price}</span>
                        {price === best && <span className={styles.bestBadge}>Best</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
