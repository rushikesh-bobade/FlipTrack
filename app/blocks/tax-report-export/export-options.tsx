import styles from "./export-options.module.css";

interface Props {
  taxYear: number;
  className?: string;
}

export function ExportOptions({ taxYear, className }: Props) {
  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <a
        href={`/api/export/tax?year=${taxYear}`}
        download
        className={styles.btn}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <span className={styles.btnIcon}>📄</span>
        CSV Export
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-subtle)",
            display: "block",
            marginTop: "2px",
          }}
        >
          For spreadsheets
        </span>
      </a>
      <button
        className={styles.btn}
        disabled
        style={{ opacity: 0.5, cursor: "not-allowed" }}
      >
        <span className={styles.btnIcon}>📊</span>
        PDF Report
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-subtle)",
            display: "block",
            marginTop: "2px",
          }}
        >
          Coming soon
        </span>
      </button>
      <button
        className={styles.btn}
        disabled
        style={{ opacity: 0.5, cursor: "not-allowed" }}
      >
        <span className={styles.btnIcon}>📝</span>
        Form 8949
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-subtle)",
            display: "block",
            marginTop: "2px",
          }}
        >
          Coming soon
        </span>
      </button>
    </div>
  );
}
