import type { Sale } from "@prisma/client";
import styles from "./sales-history.module.css";

interface Props {
  className?: string;
  sale:
    | (Pick<Sale, "marketplace" | "currency" | "buyerHandle" | "trackingNumber" | "notes"> & {
        salePrice: number;
        saleDate: string | Date;
      })
    | null;
}

export function SalesHistory({ className, sale }: Props) {
  if (!sale) {
    return (
      <div className={[styles.card, className].filter(Boolean).join(" ")}>
        <div className={styles.title}>Sales History</div>
        <p className={styles.empty}>This item has not been sold yet.</p>
      </div>
    );
  }

  const formattedSaleDate = new Date(sale.saleDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const displayMarketplace = sale.marketplace
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const formatMoney = (val: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(val);
  };

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Sales History</div>
      <div className={styles.row}>
        <div className={styles.field}>
          <div className={styles.label}>Sale Date</div>
          <div className={styles.value}>{formattedSaleDate}</div>
        </div>
        <div className={styles.field}>
          <div className={styles.label}>Sale Price</div>
          <div className={[styles.value, styles.profit].join(" ")}>{formatMoney(sale.salePrice, sale.currency)}</div>
        </div>
        <div className={styles.field}>
          <div className={styles.label}>Marketplace</div>
          <div className={styles.value}>{displayMarketplace}</div>
        </div>
        {sale.buyerHandle && (
          <div className={styles.field}>
            <div className={styles.label}>Buyer</div>
            <div className={styles.value}>{sale.buyerHandle}</div>
          </div>
        )}
        {sale.trackingNumber && (
          <div className={styles.field}>
            <div className={styles.label}>Tracking</div>
            <div className={styles.value}>{sale.trackingNumber}</div>
          </div>
        )}
        {sale.notes && (
          <div className={styles.field}>
            <div className={styles.label}>Notes</div>
            <div className={styles.value}>{sale.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}
