import { Link } from "react-router";
import { mockInventoryItems } from "~/data/mock-data";
import styles from "./related-items.module.css";

interface Props {
  className?: string;
}

export function RelatedItems({ className }: Props) {
  const related = mockInventoryItems.slice(1, 5);
  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.title}>Related Items</div>
      <div className={styles.grid}>
        {related.map((item) => (
          <Link key={item.id} to={`/app/inventory/${item.id}`} className={styles.card}>
            <div className={styles.image}>Image</div>
            <div className={styles.name}>{item.name}</div>
            <div className={styles.price}>${item.marketValue}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
