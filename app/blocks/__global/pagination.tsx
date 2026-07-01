import { useSearchParams } from "react-router";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import styles from "./pagination.module.css";

interface Props {
  totalPages: number;
}

export function Pagination({ totalPages }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(newPage));
    setSearchParams(nextParams);
  };

  const handlePageSizeChange = (newSize: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("pageSize", String(newSize));
    nextParams.set("page", "1"); // Reset to page 1
    setSearchParams(nextParams);
  };

  if (totalPages <= 1 && pageSize === 10) return null;

  return (
    <div className={styles.pagination}>
      <div className={styles.pageSize}>
        <span className={styles.label}>Rows per page:</span>
        <select
          className={styles.select}
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className={styles.nav}>
        <button
          className={styles.btn}
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          <IconChevronLeft size={16} />
          <span>Previous</span>
        </button>
        <span className={styles.indicator}>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          className={styles.btn}
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          <span>Next</span>
          <IconChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
