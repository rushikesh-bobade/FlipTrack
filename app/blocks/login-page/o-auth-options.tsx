import { getSupabaseBrowserClient } from "~/utils/supabase.client";
import styles from "./o-auth-options.module.css";

interface Props { className?: string; }

export function OAuthOptions({ className }: Props) {
  const handleOAuth = async (provider: "google" | "github") => {
    const supabase = getSupabaseBrowserClient();

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.divider}>
        <div className={styles.line} />
        <span className={styles.dividerText}>or continue with</span>
        <div className={styles.line} />
      </div>
      <button type="button" className={styles.googleBtn} onClick={() => void handleOAuth("google")}>
        <span className={styles.googleIcon}>G</span>
        Continue with Google
      </button>
      <button
        type="button"
        className={styles.googleBtn}
        onClick={() => void handleOAuth("github")}
        style={{ marginTop: "var(--space-3)" }}
      >
        <span className={styles.googleIcon}>GH</span>
        Continue with GitHub
      </button>
    </div>
  );
}
