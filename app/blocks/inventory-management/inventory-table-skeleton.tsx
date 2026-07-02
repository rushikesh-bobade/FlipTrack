import { Skeleton } from "~/blocks/__global/skeleton";
import styles from "./inventory-table.module.css";

export function InventoryTableSkeleton() {
  return (
    <div className={styles.wrap}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}><input type="checkbox" className={styles.checkbox} disabled /></th>
              <th className={styles.th}>Item</th>
              <th className={styles.th}>SKU</th>
              <th className={styles.th}>Size</th>
              <th className={styles.th}>Buy Price</th>
              <th className={styles.th}>Market Value</th>
              <th className={styles.th}>P/L</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className={styles.tr}>
                <td className={styles.td}><input type="checkbox" className={styles.checkbox} disabled /></td>
                <td className={styles.td}><Skeleton width="140px" height="14px" /></td>
                <td className={styles.td}><Skeleton width="80px" height="14px" /></td>
                <td className={styles.td}><Skeleton width="40px" height="14px" /></td>
                <td className={styles.td}><Skeleton width="60px" height="14px" /></td>
                <td className={styles.td}><Skeleton width="60px" height="14px" /></td>
                <td className={styles.td}><Skeleton width="50px" height="14px" /></td>
                <td className={styles.td}><Skeleton width="60px" height="22px" /></td>
                <td className={styles.td}><Skeleton width="80px" height="28px" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}