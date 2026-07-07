## Description
The Inventory page has a search input and a Filter button in the header (`app/blocks/inventory-management/inventory-header.tsx`), but they are purely visual — no `onChange` handler, no state, and no filtering logic is connected.

## Expected Behavior
- **Search**: Typing in the search box should filter inventory items in real-time by matching against item name, SKU, or brand
- **Filter dropdown**: The Filter button should open a dropdown/popover allowing filtering by Status (In Stock, Listed, Sold) and Condition (Deadstock, New with Box, Used)

## Technical Hints
- Add `onSearch` callback prop to `InventoryHeader` component
- In the parent route (`inventory-management.tsx`), add `useState` for search query and filter items client-side using `.filter()`
- Pass filtered items to `InventoryTable` instead of the raw array
- For the filter dropdown, consider a simple popover with checkboxes for status/condition

## Difficulty
**Beginner** — Great first contribution!

## Files to Modify
- `app/blocks/inventory-management/inventory-header.tsx` (wire up search input)
- `app/routes/inventory-management.tsx` (add filter state and logic)
