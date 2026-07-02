import { Link } from "react-router";
import { IconPlayerPlay } from "@tabler/icons-react";
import styles from "./hero-section.module.css";

interface Props {
  className?: string;
}

const mockStats = [
  { label: "Portfolio Value", value: "$24,850", change: "+12.4%" },
  { label: "Revenue (Mo)", value: "$8,320", change: "+8.1%" },
  { label: "Net Profit", value: "$2,940", change: "+15.3%" },
  { label: "Active Items", value: "47", change: "+3" },
];

const barHeights = [40, 60, 45, 80, 55, 90, 70, 85, 65, 95, 75, 100];

export function HeroSection({ className }: Props) {
  return (
    <section className={[styles.hero, className].filter(Boolean).join(" ")}>
      <div className={styles.heroBg} />
      <div className={styles.grid} />



      <h1 className={styles.headline}>
        Your Reselling Empire,
        <br />
        <span className={styles.accent}>Tracked in Real Time.</span>
      </h1>

      <p className={styles.subheadline}>
        FlipTrack replaces your spreadsheet with live market prices, smart alerts,
        and AI-powered insights &mdash; built for serious resellers.
      </p>

      <div className={styles.ctas}>
        <Link to="/auth/signup" className={styles.btnPrimary}>
          Start Free &mdash; No Credit Card
        </Link>
        <Link to="/features" className={styles.btnSecondary}>
          <IconPlayerPlay size={16} />
          See How It Works
        </Link>
      </div>

      <div className={styles.mockup}>
        <div className={styles.mockupBar}>
          <div className={styles.mockupDot} style={{ background: "#FF5F57" }} />
          <div className={styles.mockupDot} style={{ background: "#FEBC2E" }} />
          <div className={styles.mockupDot} style={{ background: "#28C840" }} />
        </div>
        <div className={styles.mockupContent}>
          <div className={styles.mockupStats}>
            {mockStats.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statChange}>{s.change}</div>
              </div>
            ))}
          </div>
          <div className={styles.mockupChartRow}>
            <div className={styles.chartBlock}>
              {barHeights.map((h, i) => (
                <div key={i} className={styles.chartBar} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className={styles.chartBlock}>
              {barHeights.slice(0, 5).map((h, i) => (
                <div key={i} className={styles.chartBar} style={{ height: `${h}%`, background: "linear-gradient(to top, #7C3AED, transparent)" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
