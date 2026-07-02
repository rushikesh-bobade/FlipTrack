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

export default function BlogIndexPage() {
  return (
    <div className={styles.page}>
      <BlogHeader />
      <FeaturedArticle />
      <ArticleGrid />
      <Pagination />
    </div>
  );
}
