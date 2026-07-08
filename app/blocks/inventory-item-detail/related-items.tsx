import { Link } from "react-router";
import styles from "./related-items.module.css";
import type { InventoryItem } from "@prisma/client";
interface Props {
  className?: string;
  items: InventoryItem[];
}

export function RelatedItems({ className, items }: Props) {
  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Related Items</div>

      <div className={styles.grid}>
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/app/inventory/${item.id}`}
            className={styles.card}
          >
            <div className={styles.image}>Image</div>
            <div className={styles.name}>{item.name}</div>
            <div className={styles.price}>
              {item.askingPrice != null ? `$${item.askingPrice}` : "N/A"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}