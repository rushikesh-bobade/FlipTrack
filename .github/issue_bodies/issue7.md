## Description
The Income Statement page has an "Export PDF" button (`app/blocks/income-statement/export-options.tsx`) and the Tax Report page has a "PDF Report" button (`app/blocks/tax-report-export/export-options.tsx`). Both buttons are purely decorative with no click handlers. Currently, only CSV export is functional.

## Expected Behavior
Clicking "Export PDF" should generate and download a professionally formatted PDF document containing the Income Statement data — including summary metrics (Revenue, COGS, Gross Profit, Net Profit), monthly breakdown, and expense categories.

## Technical Hints
- Install a PDF generation library like `jspdf` and `jspdf-autotable` (for tables) — `npm install jspdf jspdf-autotable`
- Generate the PDF client-side using data already available from the loader
- Format the document with a header (FlipTrack branding), date range, summary table, and detailed breakdown
- Trigger browser download using `doc.save('fliptrack_income_statement.pdf')`

## Difficulty
**Intermediate**

## Files to Modify
- `app/blocks/income-statement/export-options.tsx` (add onClick handler)
- `app/routes/income-statement.tsx` (pass loader data to export component)
- `package.json` (add jspdf dependency)
