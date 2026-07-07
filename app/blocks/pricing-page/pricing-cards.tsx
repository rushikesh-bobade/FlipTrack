import { useState } from "react";
import { Link } from "react-router";
import { IconCheck } from "@tabler/icons-react";
import styles from "./pricing-cards.module.css";
import { useTilt } from "~/hooks/use-tilt";
import { useMagnetic } from "~/hooks/use-magnetic";

interface Props { className?: string; }

const plans = [
  { name: "Free", monthly: 0, yearly: 0, desc: "Start for free. No credit card needed.", features: ["Up to 15 inventory items", "5 price alerts", "Basic dashboard", "Manual price check", "CSV export"], cta: "Get Started Free", link: "/auth/signup", featured: false },
  { name: "Pro", monthly: 12, yearly: 9.6, desc: "Unlimited tracking, AI, and tax exports.", features: ["Unlimited inventory", "25 price alerts", "Live price sync", "AI price insights", "Tax report export", "Email & SMS alerts", "Dark theme"], cta: "Start Pro Trial", link: "/auth/signup", featured: true },
  { name: "Business", monthly: 25, yearly: 20, desc: "Teams and power resellers.", features: ["Everything in Pro", "Unlimited alerts", "5 team members", "Push notifications", "Unicorn theme", "Priority support", "API access"], cta: "Get Business", link: "/auth/signup", featured: false },
];

function PricingCTA({ p }: { p: typeof plans[0] }) {
  const magneticRef = useMagnetic<HTMLAnchorElement>();
  return (
    <Link ref={magneticRef} to={p.link} className={[styles.btn, p.featured ? styles.btnPrimary : styles.btnOutline].join(" ")}>{p.cta}</Link>
  );
}

function PricingCardItem({ p, annual }: { p: typeof plans[0], annual: boolean }) {
  const tiltRef = useTilt<HTMLDivElement>();
  return (
    <div ref={tiltRef} className={[styles.card, p.featured ? styles.featured : ""].join(" ")}>
      {p.featured && <div className={styles.featuredBadge}>Most Popular</div>}
      <div className={styles.planName}>{p.name}</div>
      <div className={styles.price}>
        <span className={styles.amount}>{p.monthly === 0 ? "Free" : `$${annual ? p.yearly : p.monthly}`}</span>
        {p.monthly > 0 && <span className={styles.per}>/mo</span>}
      </div>
      <p className={styles.desc}>{p.desc}</p>
      <div className={styles.divider} />
      <div className={styles.features}>
        {p.features.map(f => (
          <div key={f} className={styles.feature}><IconCheck size={14} className={styles.check} />{f}</div>
        ))}
      </div>
      <PricingCTA p={p} />
    </div>
  );
}

export function PricingCards({ className }: Props) {
  const [annual, setAnnual] = useState(false);
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <div className={styles.toggle}>
          <span className={styles.toggleLabel}>Monthly</span>
          <button className={[styles.toggleBtn, annual ? styles.active : ""].join(" ")} onClick={() => setAnnual(a => !a)}>
            <div className={styles.thumb} />
          </button>
          <span className={styles.toggleLabel}>Annual</span>
          <span className={styles.saveBadge}>Save 20%</span>
        </div>
        <div className={styles.grid}>
          {plans.map(p => (
            <PricingCardItem key={p.name} p={p} annual={annual} />
          ))}
        </div>
      </div>
    </section>
  );
}
