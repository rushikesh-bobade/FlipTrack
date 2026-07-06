## Description
The Dashboard currently shows revenue/expense data in `CashFlowChart` and `SalesByMarketplacePie`, but there is no dedicated chart visualizing how expenses break down by category (Shipping, Marketplace Fees, Bot Fees, Supplies, Other). This makes it hard for resellers to quickly identify where their money is going.

## Expected Behavior
Add an **Expense Categories Breakdown** chart (donut/pie chart or horizontal bar chart) to the Dashboard that visually shows the distribution of expenses by type. Each category should be color-coded and show the percentage and dollar amount.

## Technical Hints
- The Dashboard loader already fetches all expenses — they just aren't grouped for this purpose
- Group expenses by `type` field (which uses the `ExpenseType` enum: SHIPPING, MARKETPLACE_FEE, BOT_FEE, SUPPLIES, OTHER)
- Use `recharts` (already installed) — `<PieChart>` with `<Pie>` and `<Cell>` for colors
- Place the new chart in the dashboard grid alongside existing charts
- Use the existing CSS variable color palette for category colors

## Difficulty
**Beginner-Intermediate**

## Files to Modify
- `app/routes/dashboard.tsx` (aggregate expense data in loader, add component to layout)
- New: `app/blocks/dashboard/expense-categories-chart.tsx`
- New: `app/blocks/dashboard/expense-categories-chart.module.css`
