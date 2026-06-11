import { IconDownload, IconCheck, IconTrash } from "@tabler/icons-react";
import styles from "./bulk-actions-bar.module.css";
import { useState } from "react";

interface Props { 
  className?: string; 
  count: number; 
  onClear: () => void; 
  selectedIds: string[];
  onDelete: (ids: string[]) => void;
  onMarkAsSold: (ids: string[]) => void;
  onExportCsv: (ids: string[]) => void;
}

export function BulkActionsBar({ 
  className, 
  count, 
  onClear, 
  selectedIds, 
  onDelete, 
  onMarkAsSold, 
  onExportCsv 
}: Props) {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete these items?")) {
      onDelete(selectedIds);
    }
  };

  const handleMarkAsSold = () => {
    onMarkAsSold(selectedIds);
  };

  const handleExportCsv = () => {
    onExportCsv(selectedIds);
  };

  return (
    <div className={[styles.bar, className].filter(Boolean).join(" ")}>
      <span className={styles.count}>{count} selected</span>
      <div className={styles.actions}>
        <button className={styles.btn} onClick={handleExportCsv}><IconDownload size={13} style={{ display: "inline", marginRight: 4 }} />Export CSV</button>
        <button className={styles.btn} onClick={handleMarkAsSold}><IconCheck size={13} style={{ display: "inline", marginRight: 4 }} />Mark as Sold</button>
        <button className={[styles.btn, styles.btnDanger].join(" ")} onClick={handleDelete}><IconTrash size={13} style={{ display: "inline", marginRight: 4 }} />Delete</button>
      </div>
      <button className={styles.clearBtn} onClick={onClear}>Clear selection</button>
    </div>
  );
}