import { Link } from "react-router";
import styles from "./article-grid.module.css";
import type { Article } from "~/routes/blog-index";

interface Props { 
  className?: string; 
  articles: Article[];
}

export function ArticleGrid({ className, articles }: Props) {
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        {articles.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyStateTitle}>No articles found</h3>
            <p className={styles.emptyStateDesc}>Try changing your search or selecting another category.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {articles.map(a => (
              <Link key={a.slug} to={`/blog/${a.slug}`} className={styles.card}>
                <div className={styles.image}>Article Image</div>
                <div className={styles.body}>
                  <div className={styles.catBadge}>{a.cat}</div>
                  <div className={styles.title}>{a.title}</div>
                  <div className={styles.excerpt}>{a.excerpt}</div>
                  <div className={styles.meta}>
                    <div className={styles.avatar}>{a.initials}</div>
                    <span>{a.author}</span>
                    <span>·</span>
                    <span>{a.date}</span>
                    <span>·</span>
                    <span>{a.readTime} read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
