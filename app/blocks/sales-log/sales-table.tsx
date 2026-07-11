import { Pagination } from "~/blocks/__global/pagination";
import styles from "./sales-table.module.css";

// Removed 'margin' and 'profit' from SortField type
export type SortField = 'item' | 'marketplace' | 'salePrice' | 'saleDate';
export type SortDirection = 'asc' | 'desc';

interface Props { 
  className?: string; 
  sales?: any[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  totalCount: number;
  pageSize: number;
}

export function SalesTable({ 
  className, 
  sales = [],
  sortField,
  sortDirection,
  onSort,
  totalCount,
  pageSize
}: Props) {
  
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const isActive = (field: SortField) => sortField === field;

  const renderSortableHeader = (field: SortField, label: string) => (
    <th 
      className={styles.th}
      onClick={() => onSort(field)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(field);
        }
      }}
      role="button"
      tabIndex={0}
      aria-sort={isActive(field) ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
      aria-label={`Sort by ${label} ${isActive(field) ? `(${sortDirection === 'asc' ? 'ascending' : 'descending'})` : ''}`}
    >
      <span className={styles.headerContent}>
        {label}
        <span className={styles.sortIndicator} aria-hidden="true">
          {getSortIndicator(field)}
        </span>
      </span>
    </th>
  );

  if (!sales || sales.length === 0) {
    return (
      <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>No sales logged yet.</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {renderSortableHeader('item', 'Item')}
              {renderSortableHeader('marketplace', 'Marketplace')}
              {renderSortableHeader('salePrice', 'Sale Price')}
              {renderSortableHeader('saleDate', 'Date')}
              {/* Margin and Profit columns are NOT sortable */}
              <th className={styles.thNonSortable}>Margin</th>
              <th className={styles.thNonSortable}>Profit</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(s => {
              const salePrice = Number(s.salePrice);
              const cost = Number(s.inventoryItem?.purchasePrice || 0);
              const platformFee = Number(s.platformFee || 0);
              const shippingCost = Number(s.shippingCost || 0);
              const profit = salePrice - cost - platformFee - shippingCost;
              const margin = salePrice > 0 ? ((profit / salePrice) * 100).toFixed(1) : 0;
              const dateObj = new Date(s.saleDate);

              return (
                <tr key={s.id} className={styles.tr}>
                  <td className={styles.td}>{s.inventoryItem?.name || 'Unknown'}</td>
                  <td className={styles.td}>{s.marketplace}</td>
                  <td className={styles.td}>${salePrice.toFixed(2)}</td>
                  <td className={styles.td}>{dateObj.toLocaleDateString()}</td>
                  <td className={styles.td}>{margin}%</td>
                  <td className={styles.td}>
                    <span className={[styles.profitBadge, profit >= 0 ? styles.positive : styles.negative].join(" ")}>
                      {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination totalPages={totalPages} />
      )}
    </div>
  );
}