import styles from "./features-header.module.css";

interface Props { className?: string; }

export function FeaturesHeader({ className }: Props) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <div className={styles.tag}>
        <span>Built for</span>
        <span className={styles.dot} />
        <span>All Resellers</span>
      </div>
        <h1 className={styles.heading}>
          Powerful Features for
          <br />
          <span className={styles.accent}>All Resellers</span>
        </h1>
        <p className={styles.desc}>
          FlipTrack bundles everything you need to run a profitable reselling business —
          from live price tracking to AI insights to professional tax reports.
        </p>
      </div>
    </div>
  );
}
