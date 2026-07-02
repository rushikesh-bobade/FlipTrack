import styles from "./alert-history.module.css";

interface Props { className?: string; alerts?: any[]; }

const history = [
  { desc: "Yeezy 350 Zebra (GOAT) dropped below $200 — alert triggered at $195", time: "May 10, 2024 2:14 PM" },
];

export function AlertHistory({ className }: Props) {
  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Alert History</div>
      {history.length === 0 ? (
        <p className={styles.empty}>No alerts have been triggered yet.</p>
      ) : (
        history.map((h, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.dot} />
            <div className={styles.desc}>{h.desc}</div>
            <div className={styles.time}>{h.time}</div>
          </div>
        ))
      )}
    </div>
  );
}
