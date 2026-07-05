import styles from "./marketplace-logos-strip.module.css";

interface Props {
  className?: string;
}

const marketplaces = [
  { name: "Amazon", file: "amazon.svg" },
  { name: "Mercari", file: "mercari.svg" },
  { name: "StockX", file: "stockx.svg" },
  { name: "GOAT", file: "goat.svg" },
  { name: "Poshmark", file: "poshmark.svg" },
  { name: "Depop", file: "depop.svg" },
  { name: "Facebook", file: "facebook.svg" },
  { name: "Grailed", file: "grailed.svg" },
  { name: "Shopify", file: "shopify.svg" },
  { name: "OfferUp", file: "offerup.svg" },
  { name: "eBay", file: "ebay.svg"},
];

export function MarketplaceLogosStrip({ className }: Props) {
  const doubled = [...marketplaces, ...marketplaces];
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <p className={styles.label}>Connected to the platforms you already use</p>
      <div style={{ overflow: "hidden" }}>
        <div className={styles.track}>
          {doubled.map((marketplace, i) => (
            <div key={i} className={styles.logo}>
              <img
                src={`/assets/logos/${marketplace.file}`}
                alt={`${marketplace.name} Logo`}
                className={styles.logoImage}
                height={32}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}