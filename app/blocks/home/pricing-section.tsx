import { useState } from "react";
import { Link } from "react-router";
import { IconCheck } from "@tabler/icons-react";
import styles from "./pricing-section.module.css";
import { useMagnetic } from "~/hooks/use-magnetic";

interface Props {
  className?: string;
}

const plans = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    desc: "Perfect for getting started. Track up to 15 items at no cost.",
    features: ["Up to 15 inventory items", "5 price alerts", "Basic dashboard", "Manual price check", "CSV export"],
    cta: "Get Started Free",
    ctaLink: "/auth/signup",
    featured: false,
  },
  {
    name: "Pro",
    monthly: 12,
    yearly: 9.6,
    desc: "For serious resellers who want unlimited tracking and AI insights.",
    features: ["Unlimited inventory items", "25 price alerts", "Real-time price sync", "AI price insights", "Tax report export", "Email & SMS alerts", "Dark theme"],
    cta: "Start Pro Trial",
    ctaLink: "/auth/signup",
    featured: true,
  },
  {
    name: "Business",
    monthly: 25,
    yearly: 20,
    desc: "For teams and power resellers who need everything.",
    features: ["Everything in Pro", "Unlimited price alerts", "Team collaboration (5 members)", "Push notifications", "Unicorn theme", "Priority support", "API access"],
    cta: "Contact Us",
    ctaLink: "/auth/signup",
    featured: false,
  },
];

function PricingCTA({ plan }: { plan: typeof plans[0] }) {
  const magneticRef = useMagnetic<HTMLAnchorElement>();
  return (
    <Link
      ref={magneticRef}
      to={plan.ctaLink}
      className={[styles.ctaBtn, plan.featured ? styles.ctaBtnPrimary : styles.ctaBtnOutline].join(" ")}
    >
      {plan.cta}
    </Link>
  );
}

export function PricingSection({ className }: Props) {
  const [annual, setAnnual] = useState(false);
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2>Simple, Transparent Pricing</h2>
          <p>Start free, upgrade when you need more. Cancel any time.</p>
        </div>
        <div className={styles.toggle}>
          <span className={styles.toggleLabel}>Monthly</span>
          <button
            className={[styles.toggleBtn, annual ? styles.active : ""].join(" ")}
            onClick={() => setAnnual((a) => !a)}
            aria-label="Toggle annual billing"
          >
            <div className={styles.toggleThumb} />
          </button>
          <span className={styles.toggleLabel}>Annual</span>
          <span className={styles.badge}>Save 20%</span>
        </div>
        <div className={styles.grid}>
          {plans.map((plan) => (
            <div key={plan.name} className={[styles.card, plan.featured ? styles.featured : ""].join(" ")}>
              {plan.featured && <div className={styles.featuredBadge}>Most Popular</div>}
              <div className={styles.planName}>{plan.name}</div>
              <div className={styles.price}>
                <span className={styles.priceAmount}>
                  {plan.monthly === 0 ? "Free" : `$${annual ? plan.yearly : plan.monthly}`}
                </span>
                {plan.monthly > 0 && <span className={styles.pricePer}>/mo</span>}
              </div>
              <p className={styles.planDesc}>{plan.desc}</p>
              <div className={styles.divider} />
              <div className={styles.features}>
                {plan.features.map((f) => (
                  <div key={f} className={styles.feature}>
                    <IconCheck size={14} className={styles.checkIcon} />
                    {f}
                  </div>
                ))}
              </div>
              <PricingCTA plan={plan} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
