import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import styles from "./general-questions.module.css";

interface Props { className?: string; }

const faqs = [
  { q: "What is FlipTrack?", a: "FlipTrack is a SaaS platform for all online resellers. It provides live price tracking, inventory management, sales logging, AI insights, and tax reporting in one platform." },
  { q: "Who is FlipTrack for?", a: "FlipTrack is built for resellers of all levels — from beginners flipping a few items a month to full-time resellers managing hundreds of items across multiple marketplaces." },
  { q: "How does FlipTrack work?", a: "You add your inventory to FlipTrack, and we automatically track live prices from eBay, Amazon, Mercari, StockX, Poshmark, and more. When you sell, you log the sale and FlipTrack calculates your profit." },
  { q: "Why choose FlipTrack over a spreadsheet?", a: "Spreadsheets require manual data entry and can't automatically track live prices. FlipTrack saves hours per week by automating price tracking, P&L calculations, and tax reporting." },
  { q: "Is there a free trial?", a: "Yes! Our Free plan is free forever with up to 15 inventory items and 5 price alerts. You can upgrade to Pro or Business at any time." },
  { q: "How do I get started?", a: "Sign up at fliptrack.io — no credit card required. Add your first inventory item and we'll start tracking prices immediately." },
];

export function GeneralQuestions({ className }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <div className={styles.catLabel}>General Questions</div>
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
