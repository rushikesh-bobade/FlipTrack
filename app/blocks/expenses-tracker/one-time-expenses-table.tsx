import styles from "./one-time-expenses-table.module.css";
import { useFetcher } from "react-router";
import { IconPencil, IconTrash } from "@tabler/icons-react";

interface Props {
  className?: string;
  expenses?: any[];
  onEdit?: (expense: any) => void;
}

export function OneTimeExpensesTable({ className, expenses = [], onEdit }: Props) {
  const fetcher = useFetcher();

  if (expenses.length === 0) {
    return <div className={[styles.wrap, className].filter(Boolean).join(" ")}><p style={{padding: '1rem', color: 'var(--color-text-secondary)'}}>No one-time expenses logged yet.</p></div>;
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this expense?")) return;
    fetcher.submit({ intent: "delete", id }, { method: "post" });
  };

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Description</th>
            <th className={styles.th}>Category</th>
            <th className={styles.th}>Amount</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(e => (
            <tr key={e.id} className={styles.tr}>
              <td className={styles.td}>{new Date(e.date).toLocaleDateString()}</td>
              <td className={styles.td}>{e.description || "—"}</td>
              <td className={styles.td}><span className={styles.catBadge}>{e.type.replace(/_/g, " ")}</span></td>
              <td className={styles.td}><span className={styles.amount}>${Number(e.amount).toFixed(2)}</span></td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button
                    className={styles.iconBtn}
                    onClick={() => onEdit?.(e)}
                    aria-label="Edit expense"
                    title="Edit"
                  >
                    <IconPencil size={16} />
                  </button>
                  <button
                    className={[styles.iconBtn, styles.iconBtnDanger].join(" ")}
                    onClick={() => handleDelete(e.id)}
                    aria-label="Delete expense"
                    title="Delete"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}