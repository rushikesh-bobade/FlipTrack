import { Form, useActionData, useNavigation } from "react-router";
import styles from "./security-section.module.css";

interface Props {
  className?: string;
}

// FIXED: Added optional intent to interface to safely prevent form message leaks
interface ActionData {
  ok: boolean;
  intent?: string;
  message?: string;
  error?: string;
}

const sessions = [
  {
    device: "Chrome on macOS",
    location: "New York, US",
    lastActive: "Active now",
  },
  {
    device: "Safari on iPhone",
    location: "New York, US",
    lastActive: "2 hours ago",
  },
];

export function SecuritySection({ className }: Props) {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const isSubmittingPassword =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "change-password";

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <h2 className={styles.title}>Security</h2>

      <Form method="post">
        <input type="hidden" name="intent" value="change-password" />

        <h3 className={styles.subTitle}>Change Password</h3>

        {/* FIXED: Form only displays errors meant specifically for change-password */}
        {actionData?.intent === "change-password" && actionData?.error && (
          <div className={styles.errorMessage} role="alert">
            {actionData.error}
          </div>
        )}

        {/* FIXED: Form only displays success messages meant specifically for change-password */}
        {actionData?.intent === "change-password" && actionData?.ok && actionData?.message && (
          <div className={styles.successMessage} role="status">
            {actionData.message}
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="currentPassword">
            Current Password
          </label>

          <input
            className={styles.input}
            type="password"
            id="currentPassword"
            name="currentPassword"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            New Password
          </label>

          <input
            className={styles.input}
            type="password"
            id="password"
            name="password"
            placeholder="Min 8 chars, uppercase, number"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirmPassword">
            Confirm Password
          </label>

          <input
            className={styles.input}
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Repeat new password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className={styles.saveBtn}
          disabled={isSubmittingPassword}
        >
          {isSubmittingPassword ? "Updating..." : "Update Password"}
        </button>
      </Form>

      <div className={styles.divider} />

      <h3 className={styles.subTitle}>Active Sessions</h3>

      {sessions.map((session, index) => (
        <div key={index} className={styles.sessionItem}>
          <div className={styles.sessionInfo}>
            <div className={styles.device}>{session.device}</div>
            <div className={styles.location}>
              {session.location} • {session.lastActive}
            </div>
          </div>

          <Form method="post">
            <input type="hidden" name="intent" value="revoke-session" />
            <input type="hidden" name="sessionIndex" value={index} />
            <button type="submit" className={styles.logoutBtn}>
              Logout
            </button>
          </Form>
        </div>
      ))}
    </div>
  );
}