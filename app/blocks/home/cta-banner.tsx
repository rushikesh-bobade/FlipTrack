import { Link } from "react-router";
import styles from "./cta-banner.module.css";
import { useMagnetic } from "~/hooks/use-magnetic";

interface Props {
  className?: string;
}

export function CtaBanner({ className }: Props) {
  const magneticRef = useMagnetic<HTMLAnchorElement>();

  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Get started today</p>
        <h2 className={styles.heading}>Ready to stop leaving money on the table?</h2>
        <p className={styles.subtext}>
          Join thousands of resellers who track smarter with FlipTrack.
        </p>
        <Link ref={magneticRef} to="/auth/signup" className={styles.btn}>Start Free Today</Link>
        <p className={styles.footnote}>No credit card required &bull; Free plan forever &bull; Upgrade any time</p>
      </div>
    </section>
  );
}
