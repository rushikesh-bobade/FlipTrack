import { Form } from "react-router";
import styles from "./account-settings.module.css";

interface Props { className?: string; user?: any; }

export function AccountSettings({ className, user }: Props) {
  if (!user) return null;

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <h2 className={styles.title}>Account Settings</h2>
      <div className={styles.avatarRow}>
        <div className={styles.avatar}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name || user.email} className={styles.avatarImage} />
          ) : (
            user.name ? user.name.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <label className={styles.uploadBtn}>
            Upload Photo
            <input className={styles.uploadInput} type="file" name="avatar" accept="image/*" />
          </label>
          <div className={styles.helperText}>PNG, JPG, or WEBP up to 5MB.</div>
        </div>
      </div>
      <Form method="post" encType="multipart/form-data">
        <input type="hidden" name="intent" value="update-profile" />
        <div className={styles.field}><label className={styles.label}>Display Name</label><input name="name" className={styles.input} defaultValue={user.name || ""} /></div>
        <div className={styles.field}><label className={styles.label}>Email</label><input className={styles.input} defaultValue={user.email} type="email" disabled /></div>
        <div className={styles.field}><label className={styles.label}>Phone</label><input name="phone" className={styles.input} defaultValue={user.phone || ""} type="tel" /></div>
        <button type="submit" className={styles.saveBtn}>Save Changes</button>
      </Form>
      <div className={styles.divider} />
      <div className={styles.dangerZone}>
        <div className={styles.dangerTitle}>Danger Zone</div>
        <div className={styles.dangerDesc}>Permanently delete your account and all associated data. This action cannot be undone.</div>
        <button className={styles.deleteBtn}>Delete Account</button>
      </div>
    </div>
  );
}
