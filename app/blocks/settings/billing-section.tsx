import { Link } from "react-router";
import styles from "./billing-section.module.css";

interface Props { className?: string; user?: any; }

export function BillingSection({ className, user }: Props) {
  if (!user) return null;

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <h2 className={styles.title}>Billing</h2>
      <div className={styles.planCard}>
        <div className={styles.planName}>{user.plan} Plan</div>
        <div className={styles.planPrice}>
          {user.plan === 'FREE' ? '$0' : user.plan === 'PRO' ? '$15' : '$49'}
          <span style={{ fontSize: 16, fontWeight: 400, color: "var(--color-text-muted)" }}>/mo</span>
        </div>
        <div className={styles.renewal}>
          {user.plan === 'FREE' ? 'Up to 15 inventory items • 5 price alerts' : 'Unlimited items • Advanced AI insights'}
        </div>
        <div className={styles.actions}>
          {user.plan === 'FREE' && (
            <Link to="/settings/billing" className={styles.upgradeBtn}>Upgrade to Pro</Link>
          )}
          <button className={styles.manageBtn}>Manage Subscription</button>
        </div>
      </div>
    </div>
  );
}
