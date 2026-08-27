import styles from "./one-time-expenses-table.module.css";
import { useFetcher } from "react-router";
import { IconPencil, IconTrash } from "@tabler/icons-react";

export type SortField = 'date' | 'type' | 'amount';
export type SortDirection = 'asc' | 'desc';

interface Props {
  className?: string;
  expenses?: any[];
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
  onEdit?: (expense: any) => void;
}

export function OneTimeExpensesTable({ className, expenses = [], sortField = 'date', sortDirection = 'desc', onSort, onEdit }: Props) {
  const fetcher = useFetcher();

  if (expenses.length === 0) {
    return <div className={[styles.wrap, className].filter(Boolean).join(" ")}><p style={{padding: '1rem', color: 'var(--color-text-secondary)'}}>No one-time expenses logged yet.</p></div>;
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this expense?")) return;
    fetcher.submit({ intent: "delete", id }, { method: "post" });
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const isActive = (field: SortField) => sortField === field;

  const renderSortableHeader = (field: SortField, label: string) => (
    <th 
      className={styles.th}
      onClick={() => onSort?.(field)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort?.(field);
        }
      }}
      role="button"
      tabIndex={0}
      aria-sort={isActive(field) ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        {label}
        <span aria-hidden="true" style={{ opacity: isActive(field) ? 1 : 0.3, fontSize: '0.8em' }}>
          {getSortIndicator(field)}
        </span>
      </span>
    </th>
  );

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <table className={styles.table}>
        <thead>
          <tr>
            {renderSortableHeader('date', 'Date')}
            <th className={styles.th}>Description</th>
            {renderSortableHeader('type', 'Category')}
            {renderSortableHeader('amount', 'Amount')}
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