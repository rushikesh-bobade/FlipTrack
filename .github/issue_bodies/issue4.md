## Description
The Inventory Item Detail page (`/app/inventory/:id`) currently renders entirely hardcoded/static data. The route at `app/routes/inventory-item-detail.tsx` has **no `loader` function**, and all child components display placeholder values like "DD1391-100", "Air Jordan 1 Retro High OG Chicago", "$170.00", etc. regardless of which item is clicked.

## Expected Behavior
Clicking on any item in the Inventory table should navigate to its detail page showing real data from the database — including the item's name, SKU, brand, size, condition, purchase price, purchase date, status, and associated sale (if sold).

## Technical Hints
- Add a `loader` function to `app/routes/inventory-item-detail.tsx` that reads the item `id` from route params
- Fetch the item using `prisma.inventoryItem.findUnique({ where: { id }, include: { sales: true, priceHistory: true } })`
- Pass the loaded data to child components as props
- Update all child components (`item-header.tsx`, `item-info-card.tsx`, etc.) to accept and render dynamic props instead of hardcoded values

## Difficulty
**Intermediate**

## Files to Modify
- `app/routes/inventory-item-detail.tsx` (add loader, pass data)
- `app/blocks/inventory-item-detail/item-header.tsx` (accept props)
- `app/blocks/inventory-item-detail/item-info-card.tsx` (accept props)
- Additional child components in `app/blocks/inventory-item-detail/`
