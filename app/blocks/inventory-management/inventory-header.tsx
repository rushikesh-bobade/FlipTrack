import { IconPlus, IconUpload, IconDownload, IconFilter } from "@tabler/icons-react";
import styles from "./inventory-header.module.css";

interface Props { 
  className?: string; 
  onAddItem?: () => void; 
  onImport?: () => void; 
  onSearch?: (query: string) => void;
}

export function InventoryHeader({ className, onAddItem, onImport, onSearch }: Props) {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      <h1 className={styles.title}>Inventory</h1>
      <div className={styles.controls}>
        <input 
          className={styles.search} 
          type="search" 
          placeholder="Search SKU, name..." 
          onChange={handleSearch}
        />
        <button className={[styles.btn, styles.btnOutline].join(" ")}><IconFilter size={14} /> Filter</button>
        <button className={[styles.btn, styles.btnOutline].join(" ")} onClick={onImport}><IconUpload size={14} /> Import</button>
        <button className={[styles.btn, styles.btnOutline].join(" ")}><IconDownload size={14} /> Export</button>
        <button className={[styles.btn, styles.btnPrimary].join(" ")} onClick={onAddItem}><IconPlus size={14} /> Add Item</button>
      </div>
    </div>
  );
}