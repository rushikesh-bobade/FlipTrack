import styles from "./showroom-grid.module.css";

interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  size: string | null;
  condition: string;
  status: string;
  askingPrice: number;
  imageUrl: string | null;
}

interface ShowroomGridProps {
  username: string;
  inventory: InventoryItem[];
}

export function ShowroomGrid({ username, inventory }: ShowroomGridProps) {
  return (
    <div className={styles.showroomContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          FLIPTRACK / <span>@{username || "seller"}</span>
        </h1>
        <div className={styles.headerActions}>
          <button className={styles.contactButton}>Request Contact</button>
        </div>
      </header>

      <div className={styles.controlsBar}>
        <input type="search" placeholder="Search inventory..." className={styles.searchInput} />
        <select className={styles.filterSelect}>
          <option>All Brands</option>
          <option>Jordan</option>
          <option>Adidas</option>
          <option>Supreme</option>
        </select>
        <select className={styles.filterSelect}>
          <option>All Sizes</option>
        </select>
      </div>

      <main className={styles.productGrid}>
        {inventory.map((item) => {
          const isSold = item.status === "SOLD";
          return (
            <article key={item.id} className={`${styles.itemCard}${isSold ? ` ${styles.sold}` : ""}`}>
              <div className={styles.imageWrapper}>
                <img src={item.imageUrl || ""} alt={item.name} className={styles.productImage} />
                {isSold ? (
                  <span className={`${styles.badge} ${styles.soldBadge}`}>SOLD</span>
                ) : (
                  <span className={styles.badge}>{item.condition.replace("_", " ")}</span>
                )}
              </div>
              <div className={styles.cardContent}>
                <span className={styles.brand}>{item.brand}</span>
                <h2 className={styles.itemName}>{item.name}</h2>
                <div className={styles.detailsRow}>
                  <span className={styles.size}>Size {item.size || "N/A"}</span>
                  <span className={styles.price}>${item.askingPrice?.toFixed(2) ?? "0.00"}</span>
                </div>
              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
}
