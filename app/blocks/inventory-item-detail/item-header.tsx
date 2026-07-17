import type { InventoryItem } from "@prisma/client";
import styles from "./item-header.module.css";

interface Props {
  className?: string;
  item: Pick<
    InventoryItem,
    "sku" | "name" | "brand" | "size" | "condition" | "imageUrl"
  >;
}

export function ItemHeader({ className, item }: Props) {
  const displayCondition = item.condition
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      <div className={styles.image}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "inherit",
            }}
          />
        ) : (
          "Product Image"
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.sku}>{item.sku}</div>

        <h1 className={styles.name}>{item.name}</h1>
      <div className={styles.meta}>
         <span>{item.brand}</span>

          {item.size && (
            <>
            <span>·</span>
            <span>{item.size}</span>
          </>
  )}

  <span>·</span>
  <span>{displayCondition}</span>
      </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.editBtn}>Edit</button>
        <button className={styles.deleteBtn}>Delete</button>
      </div>
    </div>
  );
}