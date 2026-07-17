import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import styles from "./features-functionality.module.css";

interface Props { className?: string; }

const faqs = [
  { q: "How accurate is price tracking?", a: "Prices are fetched directly from marketplace APIs and product pages every 15 minutes. Accuracy matches what you'd see if you checked manually." },
  { q: "How fast do price alerts trigger?", a: "Within 15 minutes of a price change meeting your criteria. Alert notifications are sent immediately once the condition is detected." },
  { q: "Which marketplaces are supported?", a: "eBay, Amazon, Mercari, Poshmark, Facebook Marketplace, Shopify, StockX, and more." },
  { q: "How does bulk Excel import work?", a: "Go to Inventory > Import Excel. Drag and drop your .xlsx or .csv file. FlipTrack validates each row and shows any errors before importing." },
  { q: "Is there an API?", a: "API access is available on the Business plan. Documentation is available at fliptrack.io/docs/api." },
  { q: "Is there a mobile app?", a: "FlipTrack is fully responsive on mobile browsers. A native app is planned for Q3 2025." },
];

export function FeaturesFunctionality({ className }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <div className={styles.catLabel}>Features &amp; Functionality</div>
        {faqs.map((f, i) => (
          <div key={i} className={styles.item}>
            <button className={styles.q} onClick={() => setOpen(open === i ? null : i)}>
              {f.q}<IconChevronDown size={16} className={[styles.chevron, open === i ? styles.open : ""].join(" ")} />
            </button>
            <div className={[styles.a, open === i ? styles.open : ""].join(" ")}>{f.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
