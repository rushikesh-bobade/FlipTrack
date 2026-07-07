import { useFetcher } from "react-router";
import styles from "./notifications.module.css";

interface Props { className?: string; user?: any; }

const notifConfig = [
  { label: "Email Notifications", desc: "Price alerts and sale summaries via email", key: "emailNotifications" },
  { label: "SMS Notifications", desc: "Price alert SMS (requires verified phone number)", key: "smsNotifications" },
  { label: "Push Notifications", desc: "Browser push notifications (Business plan)", key: "pushNotifications" },
  { label: "Weekly Summary", desc: "Weekly portfolio summary email every Monday", key: "weeklySummary" },
  { label: "Price Alert Triggered", desc: "Notify when a price alert is triggered", key: "priceAlertTriggered" },
];

export function Notifications({ className, user }: Props) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" className={[styles.section, className].filter(Boolean).join(" ")}>
      <input type="hidden" name="intent" value="update-notifications" />
      <h2 className={styles.title}>Notification Preferences</h2>
      {notifConfig.map(n => (
        <div key={n.key} className={styles.item}>
          <div className={styles.itemInfo}>
            <div className={styles.label}>{n.label}</div>
            <div className={styles.desc}>{n.desc}</div>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              name={n.key}
              defaultChecked={user ? user[n.key] : false}
              onChange={(e) => {
                const form = e.currentTarget.form;
                if (form) {
                  const formData = new FormData(form);
                  formData.set(n.key, e.currentTarget.checked ? "on" : "off");
                  fetcher.submit(formData, { method: "post" });
                }
              }}
            />
            <span className={styles.slider} />
          </label>
        </div>
      ))}
    </fetcher.Form>
  );
}
