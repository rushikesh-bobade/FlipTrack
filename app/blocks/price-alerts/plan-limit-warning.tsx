import { Link } from "react-router";
import styles from "./plan-limit-warning.module.css";

interface Props { className?: string; show?: boolean; }

export function PlanLimitWarning({ className, show = false }: Props) {
  if (!show) return null;
  return (
    <div className={[styles.banner, className].filter(Boolean).join(" ")}>
      <span className={styles.text}>⚠️ You&apos;ve reached your 5-alert limit on the Free plan. Upgrade to Pro for 25 alerts.</span>
      <Link to="/settings/billing" className={styles.upgradeBtn}>Upgrade to Pro</Link>
    </div>
  );
}
