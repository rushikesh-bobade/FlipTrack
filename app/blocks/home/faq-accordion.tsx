import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import styles from "./faq-accordion.module.css";

interface Props {
  className?: string;
}

const faqs = [
  {
    q: "What is FlipTrack?",
    a: "FlipTrack is a SaaS platform for all online resellers. It tracks live market prices across eBay, Amazon, Mercari, StockX, Poshmark, and more. It manages your inventory, logs sales, and generates P&L and tax reports — all in one place.",
  },
  {
    q: "Is FlipTrack really free?",
    a: "Yes! Our Free plan lets you track up to 15 inventory items and 5 price alerts at no cost, forever. Upgrade to Pro ($12/mo) or Business ($25/mo) for unlimited items, AI insights, tax exports, and more.",
  },
  {
    q: "How does price tracking work?",
    a: "FlipTrack fetches live ask prices from all connected marketplaces every 15 minutes automatically. You can also manually trigger a refresh at any time. Prices are cached and displayed in a single comparison table — no tab switching required.",
  },
  {
    q: "Which marketplaces are supported?",
    a: "We currently support eBay, Amazon, Mercari, Poshmark, Facebook Marketplace, Shopify, StockX, and more. New marketplaces are added regularly — vote on GitHub to prioritize your favorites.",
  },
  {
    q: "Is there a mobile app?",
    a: "FlipTrack is fully responsive and works great on mobile browsers. A native iOS and Android app is planned for Q3 2025. In the meantime, you can add FlipTrack to your home screen as a Progressive Web App.",
  },
  {
    q: "How do price alerts work?",
    a: "Set a target price and direction (above or below) for any item. FlipTrack checks prices every 15 minutes and sends you a notification — via email, SMS (if verified), or web push — the moment the condition is triggered.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data is encrypted in transit (TLS) and at rest. We use Supabase with Row Level Security — meaning your data is only accessible by you. We never sell your data. See our Privacy Policy for full details.",
  },
  {
    q: "How is FlipTrack different from a spreadsheet?",
    a: "Spreadsheets require manual data entry, break easily, can't fetch live prices, and have no alerts. FlipTrack automates price tracking, calculates P&L in real time, provides AI insights, and generates tax reports — saving you hours every week.",
  },
];

export function FaqAccordion({ className }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about FlipTrack.</p>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className={styles.item}>
            <button
              className={styles.question}
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              {faq.q}
              <IconChevronDown size={18} className={[styles.chevron, open === i ? styles.open : ""].join(" ")} />
            </button>
            <div className={[styles.answer, open === i ? styles.open : ""].join(" ")}>
              {faq.a}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
