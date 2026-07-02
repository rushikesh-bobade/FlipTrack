## Description
The Dashboard header has a date range dropdown (`<select>`) with options for "This Month", "Last 3 Months", "Last Year", and "Custom". However, the dropdown has no `onChange` handler and the dashboard loader fetches ALL sales and expenses without any date filtering.

## Expected Behavior
Selecting a date range from the dropdown should dynamically filter the dashboard data (stats cards, charts, recent sales) to only show data within that time period. The charts and KPIs should update accordingly.

## Technical Hints
- Use `useSearchParams()` to store the selected date range in the URL (e.g., `?range=3m`)
- In the dashboard `loader`, read the `range` search param and apply date filters to Prisma queries using `where: { saleDate: { gte: startDate } }`
- Calculate `startDate` based on the selected range (this month, last 3 months, last year)
- Pass the selected range back to the component so the dropdown shows the correct selection

## Difficulty
**Intermediate**

## Files to Modify
- `app/blocks/dashboard/dashboard-header.tsx` (wire up onChange)
- `app/routes/dashboard.tsx` (add date filtering to loader)
