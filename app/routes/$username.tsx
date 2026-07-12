import React from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/$username"; // React Router v7 automatic types helper
import styles from "./Showroom.module.css";

interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  size: string | null;
  condition: string;
  askingPrice: number;
  imageUrl: string | null;
}

// 🌟 UPDATE 2: Scaffolded framework loader function reading dynamic params
export async function loader({ params }: Route.LoaderArgs) {
  const username = params.username;

  const mockInventory: InventoryItem[] = [
    { id: "1", name: "Air Jordan 1 Retro High OG 'Chicago'", brand: "Jordan", size: "US 10.5", condition: "NEW", askingPrice: 450.0, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop" },
    { id: "2", name: "Supreme Box Logo Hoodie", brand: "Supreme", size: "L", condition: "NEW", askingPrice: 290.0, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop" },
    { id: "3", name: "Yeezy Boost 350 V2 'Salt'", brand: "Adidas", size: "US 11", condition: "USED_EXCELLENT", askingPrice: 320.0, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop" }
  ];

  return { username, inventory: mockInventory };
}

export default function PublicShowroom() {
  // 🌟 UPDATE 2: Consuming the data returned from our loader function
  const { username, inventory } = useLoaderData<typeof loader>();

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
        {inventory.map((item) => (
          <article key={item.id} className={styles.itemCard}>
            <div className={styles.imageWrapper}>
              <img src={item.imageUrl || ""} alt={item.name} className={styles.productImage} />
              <span className={styles.badge}>{item.condition.replace("_", " ")}</span>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.brand}>{item.brand}</span>
              <h2 className={styles.itemName}>{item.name}</h2>
              <div className={styles.detailsRow}>
                <span className={styles.size}>Size {item.size || "N/A"}</span>
                <span className={styles.price}>${item.askingPrice?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}