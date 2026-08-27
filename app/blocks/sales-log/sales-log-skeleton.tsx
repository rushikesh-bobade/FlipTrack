import { Skeleton } from "~/blocks/__global/skeleton";
import styles from "./sales-table.module.css";

export function SalesTableSkeleton() {
  return (
    <div className={styles.wrap}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>ß
          <thead>
            <tr>
              <th className={styles.th}>Item</th>
              <th className={styles.th}>Marketplace</th>
              <th className={styles.th}>Sale Price</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Margin</th>
              <th className={styles.th}>Profit</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className={styles.tr}>
                <td className={styles.td}><Skeleton width="120px" height="14px" /></td>
                <td className={styles.td}><Skeleton width="80px" height="14px" /></td>
                <td className={styles.td}><Skeleton width="60px" height="14px" /></td>
                <td className={styles.td}><Skeleton width="70px" height="14px" /></td>
                <td className={styles.td}><Skeleton width="40px" height="14px" /></td>
                <td className={styles.td}><Skeleton width="60px" height="14px" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}