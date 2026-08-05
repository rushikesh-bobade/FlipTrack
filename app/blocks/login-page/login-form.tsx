import { Form, Link, useActionData, useNavigation } from "react-router";
import styles from "./login-form.module.css";
import { useRef } from "react";

interface Props { className?: string; }

export function LoginForm({ className }: Props) {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  const handleDemoLogin = () => {
    const form = formRef.current;
    if (!form) return;

    (form.elements.namedItem("email") as HTMLInputElement).value = "demo@fliptrack.app";
    (form.elements.namedItem("password") as HTMLInputElement).value = "password123";

    form.requestSubmit();
  };

  return (
    <Form ref={formRef} method="post" className={[styles.form, className].filter(Boolean).join(" ")}>
      {actionData?.error && (
        <div style={{ color: "red", fontSize: 14, marginBottom: 12 }}>{actionData.error}</div>
      )}
      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input className={styles.input} type="email" name="email" placeholder="your@email.com" required />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Password</label>
        <input className={styles.input} type="password" name="password" placeholder="••••••••" required />
      </div>
      <div className={styles.row}>
        <label className={styles.rememberLabel}>
          <input type="checkbox" style={{ accentColor: "var(--color-primary)" }} />
          Remember me
        </label>
        <Link to="/auth/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
      </div>
      <button type="submit" className={styles.submitBtn}>Sign In</button>
      <button
        type="button"
        className={styles.submitBtn}
        style={{ background: "transparent", border: "1px solid var(--color-border-strong)", marginTop: "var(--space-2)", color: "var(--color-text)" }}
        onClick={handleDemoLogin}
        disabled={isSubmitting}

      >
        {isSubmitting ? "Signing in..." : "Use Demo Credentials"}
      </button>
    </Form>
  );
}
