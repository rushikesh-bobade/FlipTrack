import styles from "./recurring-expenses-section.module.css";
import { useFetcher } from "react-router";


interface Props { className?: string; recurring?: any[]; }

export function RecurringExpensesSection({ className, recurring = [] }: Props) {
  const fetcher = useFetcher();
  if (recurring.length === 0) return null;

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Recurring Monthly Expenses</div>
      <div className={styles.items}>
        {recurring.map(e => (
          <div key={e.id} className={styles.item}>
            <div className={styles.left}>
              <div className={styles.desc}>{e.description}</div>
              <div className={styles.day}>Bills on day {e.dayOfMonth} of each month ({e.type.replace(/_/g, " ")})</div>
            </div>
            <div className={styles.right}>
              <span className={styles.amount}>${Number(e.amount).toFixed(2)}/mo</span>

              <input type="checkbox"
              className={styles.toggle}
              defaultChecked={e.isActive}
              onChange={(event) => {
                const formData = new FormData();
                formData.append("intent", "toggle");
                formData.append("id", String(e.id));
                formData.append("isActive", String(event.target.checked));

                fetcher.submit(formData, { method: "post" });
              }}
            />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
