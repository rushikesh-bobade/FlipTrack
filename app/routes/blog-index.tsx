import { useState, useMemo, useEffect } from "react";
import styles from "./blog-index.module.css";
import { BlogHeader } from "~/blocks/blog-index/blog-header";
import { FeaturedArticle } from "~/blocks/blog-index/featured-article";
import { ArticleGrid } from "~/blocks/blog-index/article-grid";
import { Pagination } from "~/blocks/blog-index/pagination";
import type { Route } from "./+types/blog-index";
import { CACHE_PUBLIC_PAGE } from "~/utils/cache-headers";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PUBLIC_PAGE,
  };
}

export interface Article {
  slug: string;
  cat: string;
  title: string;
  excerpt: string;
  author: string;
  initials: string;
  date: string;
  readTime: string;
}

const articles: Article[] = [
  { slug: "stockx-vs-goat", cat: "Tips & Tricks", title: "StockX vs GOAT: Which Platform Has Better Seller Fees in 2024?", excerpt: "We compared seller fees, payout speed, and dispute handling across both platforms to help you decide where to list.", author: "Marcus T.", initials: "MT", date: "May 15", readTime: "6 min" },
  { slug: "ai-reselling", cat: "News", title: "How AI is Changing the Sneaker Reselling Game", excerpt: "GPT-4 powered tools are now giving resellers institutional-grade price analysis. Here's what that means for your margins.", author: "Jordan K.", initials: "JK", date: "May 10", readTime: "5 min" },
  { slug: "tax-guide", cat: "Tips & Tricks", title: "Reseller Tax Guide 2024: What You Need to Know", excerpt: "Capital gains, Schedule D, 1099-K thresholds — everything you need to file correctly and keep more of your profits.", author: "Alex R.", initials: "AR", date: "May 5", readTime: "10 min" },
  { slug: "inventory-tips", cat: "Tips & Tricks", title: "5 Inventory Management Habits of Top Resellers", excerpt: "The most profitable resellers all share these habits. Here's how to systemize your inventory for maximum efficiency.", author: "Sam L.", initials: "SL", date: "Apr 28", readTime: "7 min" },
  { slug: "yeezy-analysis", cat: "Market Analysis", title: "Yeezy Market Analysis: Are Prices Recovering?", excerpt: "Post-Ye controversy, Yeezy prices have been volatile. We analyzed 6 months of data to see where the market is heading.", author: "Marcus T.", initials: "MT", date: "Apr 20", readTime: "8 min" },
  { slug: "launch-tips", cat: "Tips & Tricks", title: "How to Win More Nike SNKRS Drops", excerpt: "From account prep to timing your entry — here's our complete guide to improving your SNKRS success rate.", author: "Jordan K.", initials: "JK", date: "Apr 15", readTime: "9 min" },
];

const PAGE_SIZE = 4;

export default function BlogIndexPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchCategory = selectedCategory === "All" || article.cat === selectedCategory;
      if (!matchCategory) return false;

      if (searchQuery.trim() === "") return true;

      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query) ||
        article.cat.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredArticles.length / PAGE_SIZE);

  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredArticles.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredArticles, currentPage]);

  return (
    <div className={styles.page}>
      <BlogHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      {searchQuery === "" && selectedCategory === "All" && currentPage === 1 && (
        <FeaturedArticle />
      )}
      <ArticleGrid articles={paginatedArticles} />
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
