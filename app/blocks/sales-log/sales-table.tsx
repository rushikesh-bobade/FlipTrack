import { useState, useMemo } from "react";
import styles from "./sales-table.module.css";

interface Props { 
  className?: string; 
  sales?: any[]; 
}

type SortField = 'item' | 'marketplace' | 'salePrice' | 'saleDate' | 'margin' | 'profit';
type SortDirection = 'asc' | 'desc';

export function SalesTable({ className, sales = [] }: Props) {
  const [sortField, setSortField] = useState<SortField>('saleDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const sortedSales = useMemo(() => {
    if (!sales || sales.length === 0) return sales;

    return [...sales].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'item':
          aValue = a.inventoryItem?.name || '';
          bValue = b.inventoryItem?.name || '';
          break;
        case 'marketplace':
          aValue = a.marketplace || '';
          bValue = b.marketplace || '';
          break;
        case 'salePrice':
          aValue = Number(a.salePrice);
          bValue = Number(b.salePrice);
          break;
        case 'saleDate':
          aValue = new Date(a.saleDate).getTime();
          bValue = new Date(b.saleDate).getTime();
          break;
        case 'margin':
          const aCost = Number(a.inventoryItem?.purchasePrice || 0);
          const bCost = Number(b.inventoryItem?.purchasePrice || 0);
          const aPrice = Number(a.salePrice);
          const bPrice = Number(b.salePrice);
          aValue = aPrice > 0 ? ((aPrice - aCost) / aPrice) * 100 : 0;
          bValue = bPrice > 0 ? ((bPrice - bCost) / bPrice) * 100 : 0;
          break;
        case 'profit':
          const aProfit = Number(a.salePrice) - Number(a.inventoryItem?.purchasePrice || 0);
          const bProfit = Number(b.salePrice) - Number(b.inventoryItem?.purchasePrice || 0);
          aValue = aProfit;
          bValue = bProfit;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sales, sortField, sortDirection]);

  const renderSortableHeader = (field: SortField, label: string) => (
    <th 
      className={styles.th}
      onClick={() => handleSort(field)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSort(field);
        }
      }}
      role="button"
      tabIndex={0}
      aria-sort={sortField === field ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
      aria-label={`Sort by ${label} ${sortField === field ? `(${sortDirection === 'asc' ? 'ascending' : 'descending'})` : ''}`}
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
              {renderSortableHeader('margin', 'Margin')}
              {renderSortableHeader('profit', 'Profit')}
            </tr>
          </thead>
          <tbody>
            {sortedSales.map(s => {
              const salePrice = Number(s.salePrice);
              const cost = Number(s.inventoryItem?.purchasePrice || 0);
              const profit = salePrice - cost;
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
    </div>
  );
}