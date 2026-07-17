import { useSearchParams, useFetcher } from "react-router";
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import styles from "./one-time-expenses-table.module.css";

// Only these columns are sortable (per issue #33).
type SortKey = "date" | "amount";
type SortDir = "asc" | "desc";

interface Props {
  className?: string;
  expenses?: any[];
  onEdit?: (expense: any) => void;
  sort?: SortKey;   // current sort column (from the loader / URL)
  dir?: SortDir;    // current sort direction (from the loader / URL)
}

export function OneTimeExpensesTable({
  className,
  expenses = [],
  onEdit,
  sort = "date",
  dir = "desc",
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();

  // Sorting now lives in the URL so the server can apply it across all pages.
  function handleSort(key: SortKey) {
    const params = new URLSearchParams(searchParams);

    if (key === sort) {
      params.set("dir", dir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", key);
      params.set("dir", "asc");
    }

    // Reset to page 1 whenever the sort changes.
    params.set("page", "1");

    setSearchParams(params);
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this expense?")) return;
    fetcher.submit({ intent: "delete", id }, { method: "post" });
  };

  if (expenses.length === 0) {
    return (
      <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
        <p style={{ padding: "1rem", color: "var(--color-text-secondary)" }}>
          No one-time expenses logged yet.
        </p>
      </div>
    );
  }

  // Renders a clickable header with the correct sort indicator + aria-sort.
  function SortableHeader({ label, columnKey }: { label: string; columnKey: SortKey }) {
    const isActive = sort === columnKey;
    return (
      <th
        className={styles.th}
        role="columnheader"
        aria-sort={isActive ? (dir === "asc" ? "ascending" : "descending") : "none"}
      >
        <button
          type="button"
          className={styles.sortButton}
          onClick={() => handleSort(columnKey)}
        >
          <span>{label}</span>
          {isActive
            ? (dir === "asc"
                ? <IconChevronUp size={14} className={styles.sortIcon} />
                : <IconChevronDown size={14} className={styles.sortIcon} />)
            : <IconSelector size={14} className={styles.sortIconInactive} />}
        </button>
      </th>
    );
  }

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <table className={styles.table}>
        <thead>
          <tr>
            <SortableHeader label="Date" columnKey="date" />
            <th className={styles.th}>Description</th>
            <th className={styles.th}>Category</th>
            <SortableHeader label="Amount" columnKey="amount" />
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(e => (
            <tr key={e.id} className={styles.tr}>
              <td className={styles.td}>{new Date(e.date).toLocaleDateString()}</td>
              <td className={styles.td}>{e.description || "—"}</td>
              <td className={styles.td}>
                <span className={styles.catBadge}>{e.type.replace(/_/g, " ")}</span>
              </td>
              <td className={styles.td}>
                <span className={styles.amount}>${Number(e.amount).toFixed(2)}</span>
              </td>
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
