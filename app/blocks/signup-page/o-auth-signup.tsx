import { getSupabaseBrowserClient } from "~/utils/supabase.client";
import styles from "./o-auth-signup.module.css";

interface Props { className?: string; }

export function OAuthSignup({ className }: Props) {
  const handleGoogleSignup = async () => {
    const supabase = getSupabaseBrowserClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleGithubSignup = async () => {
    const supabase = getSupabaseBrowserClient();

    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <button type="button" className={styles.googleBtn} onClick={() => void handleGoogleSignup()}>
        <span style={{ fontWeight: 700 }}>G</span>
        Sign up with Google
      </button>
      <button type="button" className={styles.googleBtn} onClick={() => void handleGithubSignup()} style={{ marginTop: "var(--space-3)" }}>
        <span style={{ fontWeight: 700 }}>GH</span>
        Sign up with GitHub
      </button>
      <div className={styles.divider}>
        <div className={styles.line} />
        <span className={styles.dividerText}>or sign up with email</span>
        <div className={styles.line} />
      </div>
    </div>
  );
}
