import React from 'react';
import { IconAlertTriangle } from 'tabler-icons-react';

interface InventoryItem {
  purchaseDate: Date;
  // other properties...
}

const InventoryTable = ({ items }: { items: InventoryItem[] }) => {
  const isStale = (purchaseDate: Date) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    return purchaseDate < ninetyDaysAgo;
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Status</th>
          <th> Purchase Date</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.purchaseDate.toISOString()}>
            <td>{/* item name */}</td>
            <td>
              {item.status}
              {isStale(item.purchaseDate) && (
                <IconAlertTriangle size={18} color="yellow" />
              )}
            </td>
            <td>{item.purchaseDate.toISOString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventoryTable;