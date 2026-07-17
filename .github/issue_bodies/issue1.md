## Description
The Inventory Management table at `/app/inventory` currently displays items in the order they were created (newest first from the database). Users cannot sort by any column.

## Expected Behavior
Users should be able to click on column headers (Item Name, SKU, Size, Buy Price, Market Value, P/L, Status) to sort the table ascending/descending. An arrow indicator should show the current sort direction.

## Technical Hints
- The table component is at `app/blocks/inventory-management/inventory-table.tsx`
- Sorting can be implemented client-side using React state since the dataset is manageable
- Add `useState` for `sortKey` and `sortDirection`, then sort the `items` array before rendering
- Add a clickable header with a chevron icon from `@tabler/icons-react`

## Difficulty
**Beginner** — Great first contribution!

## Files to Modify
- `app/blocks/inventory-management/inventory-table.tsx`
- `app/blocks/inventory-management/inventory-table.module.css` (for sortable header styles)
