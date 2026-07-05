## Description
No tables in FlipTrack (Inventory, Sales Log, Expenses) have pagination. All records are fetched and rendered at once, which will cause performance issues as the dataset grows.

## Expected Behavior
Each table should display a configurable number of rows per page (e.g., 10, 25, 50) with Previous/Next navigation and a page indicator (e.g., "Page 2 of 5").

## Technical Hints
- Implement pagination at the **loader level** using Prisma's `take` and `skip` parameters
- Read `page` and `pageSize` from `URL searchParams` in the loader
- Create a reusable `<Pagination />` component in `app/blocks/__global/`
- Use `useSearchParams()` from React Router to navigate between pages without full reloads
- Also fetch the total count using `prisma.inventoryItem.count()` to calculate total pages

## Difficulty
**Beginner-Intermediate**

## Files to Modify
- `app/routes/inventory-management.tsx` (loader)
- `app/routes/sales-log.tsx` (loader)
- `app/routes/expenses-tracker.tsx` (loader)
- New: `app/blocks/__global/pagination.tsx`
- New: `app/blocks/__global/pagination.module.css`
