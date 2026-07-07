import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import styles from "./pagination.module.css";

interface Props { 
  className?: string; 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ className, currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <button 
          className={styles.btn} 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
          disabled={currentPage === 1}
          aria-label="Previous page"
          title="Previous page"
        >
          <IconChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button 
            key={p} 
            className={[styles.btn, p === currentPage ? styles.active : ""].join(" ")} 
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        ))}
        <button 
          className={styles.btn} 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
          disabled={currentPage === totalPages}
          aria-label="Next page"
          title="Next page"
        >
          <IconChevronRight size={14} />
        </button>
      </div>
    </nav>
  );
}
