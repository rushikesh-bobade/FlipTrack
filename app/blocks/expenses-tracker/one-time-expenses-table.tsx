import { useMemo, useState } from "react";
import { IconChevronUp, IconChevronDown, IconSelector } from "@tabler/icons-react";
import styles from "./one-time-expenses-table.module.css";

interface Props { className?: string; expenses?: any[]; }

// Only these columns are sortable (per issue #33).
type SortKey = "date" | "amount";
type SortDir = "asc" | "desc";

export function OneTimeExpensesTable({ className, expenses = [] }: Props) {
  // Default to date descending so the initial view matches the loader's
  // `orderBy: { date: "desc" }` ordering — nothing jumps on first render.
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      // Same column clicked again → flip direction.
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      // New column → select it, start ascending.
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedExpenses = useMemo(() => {
    // Copy first — never mutate the prop array in place.
    return [...expenses].sort((a, b) => {
      let comparison = 0;

      if (sortKey === "amount") {
        // `amount` is a Prisma Decimal serialized as a string.
        comparison = Number(a.amount) - Number(b.amount);
      } else {
        // `date` is an ISO date string.
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [expenses, sortKey, sortDir]);

  if (expenses.length === 0) {
    return <div className={[styles.wrap, className].filter(Boolean).join(" ")}><p style={{padding: '1rem', color: 'var(--color-text-secondary)'}}>No one-time expenses logged yet.</p></div>;
  }

  // Renders a clickable header with the correct sort indicator + aria-sort.
  function SortableHeader({ label, columnKey }: { label: string; columnKey: SortKey }) {
    const isActive = sortKey === columnKey;
    return (
      <th
        className={styles.th}
        aria-sort={isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      >
        <button
          type="button"
          className={styles.sortButton}
          onClick={() => handleSort(columnKey)}
        >
          <span>{label}</span>
          {isActive
            ? (sortDir === "asc"
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
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map(e => (
            <tr key={e.id} className={styles.tr}>
              <td className={styles.td}>{new Date(e.date).toLocaleDateString()}</td>
              <td className={styles.td}>{e.description || "—"}</td>
              <td className={styles.td}><span className={styles.catBadge}>{e.type.replace(/_/g, " ")}</span></td>
              <td className={styles.td}><span className={styles.amount}>${Number(e.amount).toFixed(2)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
