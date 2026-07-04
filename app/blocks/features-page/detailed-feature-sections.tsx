import styles from "./detailed-feature-sections.module.css";
import { useTilt } from "~/hooks/use-tilt";

interface Props { className?: string; }

const sections = [
  {
    title: "Inventory Management Built for Volume",
    desc: "Track every item with full detail: SKU, brand, size, condition, purchase price, and status. Bulk import from Excel in seconds. Image uploads to cloud storage.",
    bullets: ["Multi-step add item form with SKU autocomplete", "Drag & drop Excel/CSV bulk import with validation", "Advanced filtering, sorting, and search", "Inline status updates without page reload"],
    reverse: false,
  },
  {
    title: "Live Prices Across All Marketplaces",
    desc: "Stop switching between tabs. FlipTrack pulls live ask prices from eBay, Amazon, Mercari, StockX, Poshmark and more every 15 minutes and shows them in one table.",
    bullets: ["Prices auto-refresh every 15 minutes", "Color-coded profit/loss vs your purchase price", "\"Best to Sell\" badge highlights highest price", "Price history charts per item"],
    reverse: true,
  },
  {
    title: "AI-Powered Price Insights",
    desc: "Our GPT-4o mini integration analyzes 30-day price trends for every item and gives you actionable buy/sell/hold recommendations with confidence scores.",
    bullets: ["BUY / SELL / HOLD recommendations per item", "Confidence scores from 0-100%", "Target price suggestions based on trend analysis", "Batch analyze entire portfolio at once"],
    reverse: false,
  },
];

function FeatureSectionItem({ s }: { s: typeof sections[0] }) {
  const tiltRef = useTilt<HTMLDivElement>();
  return (
    <div className={[styles.row, s.reverse ? styles.reverse : ""].join(" ")}>
      <div className={styles.content}>
        <h3>{s.title}</h3>
        <p>{s.desc}</p>
        <div className={styles.bullets}>
          {s.bullets.map((b) => (
            <div key={b} className={styles.bullet}>
              <span>✓</span> {b}
            </div>
          ))}
        </div>
      </div>
      <div ref={tiltRef} className={styles.mockup}>Feature Preview</div>
    </div>
  );
}

export function DetailedFeatureSections({ className }: Props) {
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        {sections.map((s) => (
          <FeatureSectionItem key={s.title} s={s} />
        ))}
      </div>
    </section>
  );
}
