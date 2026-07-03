import { Form } from "react-router";
import styles from "./preferences.module.css";

interface Props { className?: string; user?: any; }

export function Preferences({ className, user }: Props) {
  return (
    <Form method="post" className={[styles.section, className].filter(Boolean).join(" ")}>
      <input type="hidden" name="intent" value="update-preferences" />
      <h2 className={styles.title}>Preferences</h2>
      <div className={styles.field}>
        <label className={styles.label}>Currency</label>
        <select name="currency" defaultValue={user?.currency || "USD"} className={styles.select}>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Theme</label>
        <select name="theme" defaultValue={user?.theme || "LIGHT"} className={styles.select}>
          <option value="LIGHT">Light</option>
          <option value="DARK">Dark</option>
          <option value="UNICORN">Unicorn</option>
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Language</label>
        <select className={styles.select} defaultValue="English"><option>English</option><option>Spanish</option><option>French</option></select>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Timezone</label>
        <select className={styles.select} defaultValue="US/Eastern"><option>US/Eastern</option><option>US/Pacific</option><option>UTC</option><option>Europe/London</option></select>
      </div>
      <button type="submit" className={styles.saveBtn}>Save Preferences</button>
    </Form>
  );
}
