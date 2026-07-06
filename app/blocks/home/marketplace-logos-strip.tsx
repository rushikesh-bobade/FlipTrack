import styles from "./marketplace-logos-strip.module.css";

interface Props {
  className?: string;
}

const marketplaces = ["eBay", "Amazon", "Mercari", "StockX", "GOAT", "Poshmark", "Depop", "Facebook", "Grailed", "Shopify", "OfferUp"];

export function MarketplaceLogosStrip({ className }: Props) {
  const doubled = [...marketplaces, ...marketplaces];
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <p className={styles.label}>Connected to the platforms you already use</p>
      <div style={{ overflow: "hidden" }}>
        <div className={styles.track}>
          {doubled.map((name, i) => (
            <div key={i} className={styles.logo}>
              <span className={styles.dot} />
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
