import styles from "./blog-header.module.css";

interface Props { 
  className?: string; 
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const categories = ["All", "Tips & Tricks", "Market Analysis", "News", "Product Updates"];

export function BlogHeader({ className, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }: Props) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>FlipTrack Blog</h1>
        <p className={styles.tagline}>Tips, insights, and updates for sneaker resellers.</p>
        <div className={styles.controls}>
          <div className={styles.categories}>
            {categories.map(c => (
              <button 
                key={c} 
                className={[styles.cat, selectedCategory === c ? styles.active : ""].join(" ")} 
                onClick={() => setSelectedCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <input 
            className={styles.search} 
            type="search" 
            placeholder="Search articles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
