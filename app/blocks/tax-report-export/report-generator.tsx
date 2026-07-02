import { useNavigate, useSearchParams } from "react-router";
import styles from "./report-generator.module.css";

interface Props {
  taxYear: number;
  className?: string;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export function ReportGenerator({ taxYear, className }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams);
    params.set("year", e.target.value);
    navigate(`?${params.toString()}`, { replace: true });
  }

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Generate Tax Report</div>
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tax-year-select">
            Tax Year
          </label>
          <select
            id="tax-year-select"
            className={styles.select}
            value={taxYear}
            onChange={handleYearChange}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Currency</label>
          <select className={styles.select}>
            <option>USD ($)</option>
            <option>CAD (CA$)</option>
            <option>GBP (£)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
