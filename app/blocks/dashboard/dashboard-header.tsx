import { useSearchParams } from "react-router";
import { IconDownload } from "@tabler/icons-react";
import styles from "./dashboard-header.module.css";

interface Props { className?: string; }

export function DashboardHeader({ className }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const range = searchParams.get("range") || "month";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("range", value);
    if (value !== "custom") {
      nextParams.delete("from");
      nextParams.delete("to");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleDateChange = (key: "from" | "to", value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        nextParams.set(key, value);
      }
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.controls}>
        {range === "custom" && (
          <div className={styles.customDates} role="group" aria-label="Custom Date Range Selector">
            <input
              type="date"
              className={styles.dateInput}
              value={from}
              onChange={(e) => handleDateChange("from", e.target.value)}
              placeholder="From"
              aria-label="Start date"
            />
            <span className={styles.dateSeparator} aria-hidden="true">to</span>
            <input
              type="date"
              className={styles.dateInput}
              value={to}
              onChange={(e) => handleDateChange("to", e.target.value)}
              placeholder="To"
              aria-label="End date"
            />
          </div>
        )}
        <select
          className={styles.select}
          value={range}
          onChange={handleRangeChange}
          aria-label="Filter dashboard by date range"
        >
          <option value="month">This Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="year">Last Year</option>
          <option value="custom">Custom</option>
        </select>
        <button className={styles.exportBtn} aria-label="Export dashboard data">
          <IconDownload size={14} /> Export
        </button>
      </div>
    </div>
  );
}
