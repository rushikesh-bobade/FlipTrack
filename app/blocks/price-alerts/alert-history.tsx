import styles from "./alert-history.module.css";

interface AlertItem {
  id: string;
  sku: string;
  size: string;
  productName: string;
  marketplace: string;
  targetPrice: number;
  direction: string;
  notificationChannel: string;
  isActive: boolean;
  triggeredAt: Date | null;
  createdAt: Date;
  userId: string;
}

interface Props { className?: string; alerts?: AlertItem[]; }    
//changed the code to avoid merge conflicts

export function AlertHistory({ className, alerts = [] }: Props) {
  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Alert History</div>
      {alerts.length === 0 ? (
        <p className={styles.empty}>No alerts have been triggered yet.</p>
      ) : (
        alerts.map((alert) => (
          <div key={alert.id} className={styles.item}>
            <div className={styles.dot} />
            <div className={styles.desc}>{`${alert.productName} (${alert.marketplace}) triggered at $${alert.targetPrice.toFixed(2)}`}</div>
            <div className={styles.time}>{alert.triggeredAt?.toLocaleString() || "Recently triggered"}</div>
          </div>
        ))
      )}
    </div>
  );
}
