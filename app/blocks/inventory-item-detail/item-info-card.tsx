import type { InventoryItem } from "@prisma/client";
import styles from "./item-info-card.module.css";

interface Props {
  className?: string;
  item: Pick<InventoryItem, "condition" | "status" | "notes" | "currency"> & {
    purchasePrice: number;
    purchaseDate: string | Date;
    askingPrice: number | null;
  };
}

export function ItemInfoCard({ className, item }: Props) {
  // Format condition and status (e.g., "new_mint" -> "New Mint")
  const displayCondition = item.condition
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const displayStatus = item.status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Format date to "Jan 5, 2026"
  const formattedPurchaseDate = new Date(item.purchaseDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Format currency handling nulls and dynamic currency codes
  const formatMoney = (val: number | null, currency: string = "USD") => {
    if (val == null) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(val);
  };

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Item Details</div>

      <div className={styles.field}>
        <div className={styles.label}>Purchase Price</div>
        <div className={[styles.value, styles.money].join(" ")}>
          {formatMoney(item.purchasePrice, item.currency)}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Purchase Date</div>
        <div className={styles.value}>{formattedPurchaseDate}</div>
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Condition</div>
        <div className={styles.value}>{displayCondition}</div>
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Status</div>
        <div className={styles.value}>
          <span className={styles.badge}>{displayStatus}</span>
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Asking Price</div>
        <div className={[styles.value, styles.money].join(" ")}>
          {formatMoney(item.askingPrice, item.currency)}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Notes</div>
        <div className={styles.value}>{item.notes || "No notes available"}</div>
      </div>
    </div>
  );
}
