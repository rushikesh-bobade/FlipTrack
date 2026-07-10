import { useState } from "react";
import { getSupabaseBrowserClient } from "~/utils/supabase.client";
import styles from "./magic-link-option.module.css";

interface Props { className?: string; }

export function MagicLinkOption({ className }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
      setSent(true);
    } catch (err: any) {
      console.error("Magic link error:", err);
      setError(
        err.message === "fetch failed"
          ? "Unable to connect to the authentication server. Please try again later."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.divider}>
        <div className={styles.line} />
        <span className={styles.dividerText}>or sign in with magic link</span>
        <div className={styles.line} />
      </div>
      {error && (
        <div style={{ color: "red", fontSize: 14, marginBottom: 12 }}>{error}</div>
      )}
      {sent ? (
        <div className={styles.success}>Magic link sent! Check your email.</div>
      ) : (
        <div className={styles.magicForm}>
          <input 
            className={styles.input} 
            type="email" 
            placeholder="your@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <button 
            className={styles.sendBtn} 
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Link"}
          </button>
        </div>
      )}
    </div>
  );
}
