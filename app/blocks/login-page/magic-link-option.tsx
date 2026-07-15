import { useState } from "react";
import { getSupabaseBrowserClient } from "~/utils/supabase.client";
import styles from "./magic-link-option.module.css";

interface Props {
  className?: string;
}

export function MagicLinkOption({ className }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendLink = async () => {
    setErrorMsg(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg("Please enter your email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setErrorMsg("Supabase is not configured (missing URL/anon key).");
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      console.error("Magic link error:", err);
      setErrorMsg(
        err.message === "fetch failed"
          ? "Unable to connect to the authentication server. Please try again later."
          : err?.message || "Failed to send magic link."
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

      {sent ? (
        <div className={styles.success}>Magic link sent! Check your email.</div>
      ) : (
        <div className={styles.magicForm}>
          <input
            className={styles.input}
            type="email"
            placeholder="your@email.com"
            aria-label="Enter your email for a magic link"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <button 
            className={styles.sendBtn} 
            aria-label="Send Magic Link" 
            onClick={handleSendLink} 
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Link"}
          </button>
        </div>
      )}

      {errorMsg && (
        <div className={styles.error}>
          {errorMsg}
        </div>
      )}
    </div>
  );
}
