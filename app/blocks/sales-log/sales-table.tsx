import styles from "./sales-table.module.css";
import { IconEdit, IconTrash } from "@tabler/icons-react";

interface Props {
  className?: string;
  sales?: any[];
  onEdit?: (sale: any) => void;
  onDelete?: (sale: any) => void;
}

export function SalesTable({
  className,
  sales = [],
  onEdit,
  onDelete, 
}: Props) {
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Item</th>
              <th className={styles.th}>Marketplace</th>
              <th className={styles.th}>Sale Price</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Margin</th>
              <th className={styles.th}>Profit</th>
              <th className={styles.th}>Actions</th>  
            </tr>
          </thead>
          <tbody>
            {sales.map(s => {
                  const salePrice = s.salePrice;
                 const cost = s.inventoryItem.purchasePrice;
              const profit = salePrice - cost;
              const margin = salePrice > 0 ? ((profit / salePrice) * 100).toFixed(1) : 0;
              const dateObj = new Date(s.saleDate);
              
              return (
                <tr key={s.id} className={styles.tr}>
                  <td className={styles.td}>{s.inventoryItem.name}</td>
                  <td className={styles.td}>{s.marketplace}</td>
                  <td className={styles.td}>${salePrice.toFixed(2)}</td>
                  <td className={styles.td}>{dateObj.toLocaleDateString()}</td>
                  <td className={styles.td}>{margin}%</td>
                  <td className={styles.td}>
                    <span className={[styles.profitBadge, profit >= 0 ? styles.positive : styles.negative].join(" ")}>
                      {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                    </span>
                  </td>

            <button
        className={styles.editBtn}
       onClick={() => onEdit?.(s)}
>
  <IconEdit size={16} />
  Edit
</button>

<button
  className={styles.deleteBtn}
  onClick={() => onDelete?.(s)}
>
  <IconTrash size={16} />
  Delete
</button>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
