import { Form, Link } from "react-router";
import styles from "./forgot-password-form.module.css";

interface Props {
  className?: string;
  error?: string;
}

export function ForgotPasswordForm({ className, error }: Props) {
  return (
    <Form method="post" className={[styles.form, className].filter(Boolean).join(" ")}>
      <h1 className={styles.heading}>Reset Password</h1>
      <p className={styles.desc}>Enter your email address and we&apos;ll send you a link to reset your password.</p>
      
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input className={styles.input} type="email" name="email" placeholder="your@email.com" required />
      </div>
      
      <button type="submit" className={styles.submitBtn}>Send Reset Link</button>
      <Link to="/auth/login" className={styles.backLink}>Back to Login</Link>
    </Form>
  );
}

