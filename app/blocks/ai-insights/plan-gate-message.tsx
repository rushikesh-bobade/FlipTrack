import { Link } from "react-router";
import styles from "./plan-gate-message.module.css";

interface Props { className?: string; }

export function PlanGateMessage({ className }: Props) {
  return (
    <div className={[styles.gate, className].filter(Boolean).join(" ")}>
      <div className={styles.icon}>🧠</div>
      <h2 className={styles.heading}>AI Insights is a Pro Feature</h2>
      <p className={styles.desc}>
        Upgrade to Pro to get AI-powered price analysis and buy/sell recommendations for every item in your inventory.
        Powered by GPT-4o mini with confidence scores and target prices.
      </p>
      <Link to="/settings/billing" className={styles.btn}>Upgrade to Pro &mdash; $12/mo</Link>
    </div>
  );
}
