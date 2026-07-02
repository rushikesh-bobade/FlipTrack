import { useState } from "react";
import { IconPlus, IconUpload, IconDownload, IconFilter } from "@tabler/icons-react";
import styles from "./inventory-header.module.css";

interface Props {
  className?: string;
  onAddItem?: () => void;
  onImport?: () => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;

  statusFilter: string;
  conditionFilter: string;

  onStatusChange: (value: string) => void;
  onConditionChange: (value: string) => void;
}

export function InventoryHeader({
  className,
  onAddItem,
  onImport,
  searchQuery = "",
  onSearch,
  statusFilter,
  conditionFilter,
  onStatusChange,
  onConditionChange,
}: Props)  {
  const [showFilters, setShowFilters] = useState(false);
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      <h1 className={styles.title}>Inventory</h1>
      <div className={styles.controls}>
        <input 
          className={styles.search} 
          type="search" 
          placeholder="Search SKU, name, brand..." 
          value={searchQuery}
          onChange={(e) => onSearch?.(e.target.value)}
        />
        <div style={{ position: "relative" }}>
  <button
    className={[styles.btn, styles.btnOutline].join(" ")}
    onClick={() => setShowFilters(!showFilters)}
  >
    <IconFilter size={14} /> Filter
  </button>

  {showFilters && (
   <div className={styles.filterDropdown}>
      
    
      <label>
        Status
        <select
  value={statusFilter}
  onChange={(e) => onStatusChange(e.target.value)}
>
  <option value="ALL">All</option>
  <option value="IN_STOCK">In Stock</option>
  <option value="LISTED">Listed</option>
  <option value="SOLD">Sold</option>
  <option value="CONSIGNED">Consigned</option>
</select>
      </label>

      <label>
        Condition
        <select
          value={conditionFilter}
          onChange={(e) => onConditionChange(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="DEADSTOCK">Deadstock</option>
          <option value="NEW_WITH_BOX">New With Box</option>
          <option value="USED">Used</option>
        </select>
      </label>
    </div>
  )}
</div>
        <button className={[styles.btn, styles.btnOutline].join(" ")} onClick={onImport}><IconUpload size={14} /> Import</button>
        <button className={[styles.btn, styles.btnOutline].join(" ")}><IconDownload size={14} /> Export</button>
        <button className={[styles.btn, styles.btnPrimary].join(" ")} onClick={onAddItem}><IconPlus size={14} /> Add Item</button>
      </div>
    </div>
  );
}
