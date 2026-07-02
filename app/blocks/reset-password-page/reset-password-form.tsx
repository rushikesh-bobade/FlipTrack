import { Form, useActionData } from "react-router";
import styles from "./reset-password-form.module.css";

interface Props {
  className?: string;
}

export function ResetPasswordForm({ className }: Props) {
  const actionData = useActionData<{ error?: string }>();

  return (
    <Form method="post" className={[styles.form, className].filter(Boolean).join(" ")}>
      <h1 className={styles.heading}>Set New Password</h1>
      <p className={styles.desc}>Choose a strong password for your FlipTrack account.</p>

      {actionData?.error && (
        <div style={{ color: "red", fontSize: 14, marginBottom: 12 }}>
          {actionData.error}
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>New Password</label>
        <input 
          className={styles.input} 
          type="password" 
          name="password" 
          placeholder="Min 6 chars" 
          required 
          minLength={6}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Confirm Password</label>
        <input 
          className={styles.input} 
          type="password" 
          name="confirmPassword" 
          placeholder="Repeat new password" 
          required 
          minLength={6}
        />
      </div>
      <button type="submit" className={styles.submitBtn}>Reset Password</button>
    </Form>
  );
}

