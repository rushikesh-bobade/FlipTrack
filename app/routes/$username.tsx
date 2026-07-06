import React, { useState } from "react";
import { useParams } from "react-router";
import styles from "./Showroom.module.css";

export default function PublicShowroom() {
  // Pulls the username directly from the /:username URL match
  const { username } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockInventory = [
    {
      id: "1",
      name: "Air Jordan 1 Retro High OG 'Chicago'",
      brand: "Jordan",
      size: "US 10.5",
      condition: "NEW",
      askingPrice: 450.0
    },
    {
      id: "2",
      name: "Yeezy Boost 350 V2 'Bred'",
      brand: "Adidas",
      size: "US 11",
      condition: "LIKE_NEW",
      askingPrice: 320.0
    }
  ];

  return (
    <div className={styles.showroomContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>@{username || "seller"}</span>'s Showroom
        </h1>
        <button className={styles.contactButton} onClick={() => setIsModalOpen(true)}>
          Contact Seller
        </button>
      </header>

      <main className={styles.productGrid}>
        {mockInventory.map((item) => (
          <article key={item.id} className={styles.itemCard}>
            <div className={styles.imageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60"
                alt={item.name}
                className={styles.productImage}
              />
              <span className={styles.badge}>{item.condition}</span>
            </div>
            
            <div className={styles.cardContent}>
              <span className={styles.brand}>{item.brand}</span>
              <h2 className={styles.itemName}>{item.name}</h2>
              <div className={styles.detailsRow}>
                <span className={styles.size}>Size {item.size}</span>
                <span className={styles.price}>${item.askingPrice}</span>
              </div>
            </div>
          </article>
        ))}
      </main>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Contact Seller</h2>
            <p className={styles.modalSub}>Reach out to discuss details or negotiate offers.</p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialButton}>Send an Email</a>
              <a href="#" className={styles.socialButton}>Instagram Profile</a>
            </div>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}