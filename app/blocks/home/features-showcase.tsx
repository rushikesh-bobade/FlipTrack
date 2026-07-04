import { Link } from "react-router";
import { IconCheck, IconArrowRight, IconChartBar, IconBell, IconBrain, IconReceipt, IconTrendingUp } from "@tabler/icons-react";
import styles from "./features-showcase.module.css";

interface Props {
  className?: string;
}

const features = [
  {
    tag: "Dashboard",
    icon: IconChartBar,
    title: "See your entire business at a glance",
    desc: "Your personal reselling command center. Portfolio value, profit, revenue, and top performers — all in one view.",
    bullets: ["Real-time portfolio valuation", "Cash flow & P&L charts", "Top brands and items by profit"],
    link: "/features",
    reverse: false,
    mockupRows: [
      { label: "Portfolio Value", value: "$24,850", color: "green" },
      { label: "Net Profit (Mo)", value: "$2,940", color: "green" },
      { label: "Active Items", value: "47", color: "" },
    ],
  },
  {
    tag: "Live Prices",
    icon: IconTrendingUp,
    title: "Stop checking 5 tabs. We check them for you.",
    desc: "Live prices from eBay, Amazon, Mercari, StockX, Poshmark and more — refreshed every 15 minutes automatically.",
    bullets: ["All marketplaces in one table", "Color-coded profit indicators", "'Best to Sell' auto-highlighted"],
    link: "/features",
    reverse: true,
    mockupRows: [
      { label: "Amazon", value: "$420", color: "green" },
      { label: "eBay", value: "$395", color: "green" },
      { label: "Mercari", value: "$340", color: "red" },
    ],
  },
  {
    tag: "Smart Alerts",
    icon: IconBell,
    title: "Get notified before prices move against you.",
    desc: "Set target prices with direction triggers. Get alerts via email, SMS, or push notification the moment conditions are met.",
    bullets: ["Price above/below thresholds", "Email, SMS & push notifications", "Alert history and management"],
    link: "/features",
    reverse: false,
    mockupRows: [
      { label: "PS5 Disc Ed. > $500", value: "ACTIVE", color: "green" },
      { label: "MacBook Air < $800", value: "TRIGGERED", color: "red" },
    ],
  },
  {
    tag: "AI Insights",
    icon: IconBrain,
    title: "Your personal reselling analyst, powered by GPT-4.",
    desc: "AI analyzes 30-day price trends for every item in your inventory and gives you BUY / SELL / HOLD recommendations.",
    bullets: ["Trend analysis per item", "Confidence scores and target prices", "Batch analyze your entire portfolio"],
    link: "/features",
    reverse: true,
    mockupRows: [
      { label: "PS5 Pro — SELL", value: "94%", color: "red" },
      { label: "iPhone 15 — HOLD", value: "71%", color: "" },
      { label: "Pokemon 151 — BUY", value: "88%", color: "green" },
    ],
  },
  {
    tag: "Tax Reports",
    icon: IconReceipt,
    title: "Stop dreading tax season.",
    desc: "Generate professional capital gains reports in one click. Export CSV or PDF ready for your accountant or Form 8949.",
    bullets: ["Capital gains calculations", "Cost basis tracking", "CSV, PDF & Form 8949 export"],
    link: "/features",
    reverse: false,
    mockupRows: [
      { label: "Total Proceeds", value: "$84,200", color: "green" },
      { label: "Total Cost Basis", value: "$61,500", color: "" },
      { label: "Net Capital Gains", value: "$22,700", color: "green" },
    ],
  },
];

export function FeaturesShowcase({ className }: Props) {
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <div className={styles.sectionHeader}>
          <h2>Everything you need to run your reselling business</h2>
          <p>Built by resellers, for resellers. Every feature designed to save time and maximize profit.</p>
        </div>
        {features.map((f) => (
          <div key={f.tag} className={[styles.featureRow, f.reverse ? styles.reverse : ""].join(" ")}>
            <div className={styles.featureContent}>
              <div className={styles.featureTag}>
                <f.icon size={12} />
                {f.tag}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className={styles.bullets}>
                {f.bullets.map((b) => (
                  <div key={b} className={styles.bullet}>
                    <div className={styles.bulletIcon}>
                      <IconCheck size={11} color="var(--color-success)" />
                    </div>
                    {b}
                  </div>
                ))}
              </div>
              <Link to={f.link} className={styles.learnMore}>
                Learn more <IconArrowRight size={14} />
              </Link>
            </div>
            <div className={styles.featureMockup}>
              <div className={styles.mockupInner}>
                {f.mockupRows.map((row) => (
                  <div key={row.label} className={styles.mockupRow}>
                    <span className={styles.mockupLabel}>{row.label}</span>
                    <span className={[styles.mockupValue, row.color ? styles[row.color as keyof typeof styles] : ""].join(" ")}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
