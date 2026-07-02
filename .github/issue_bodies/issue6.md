## Description
The Bulk Actions Bar in the Inventory page appears when items are selected via checkboxes, displaying "Export CSV", "Mark as Sold", and "Delete" buttons. However, none of these buttons have `onClick` handlers or form submissions — they are purely visual.

## Expected Behavior
- **Delete**: Clicking "Delete" should prompt a confirmation dialog, then delete all selected items from the database
- **Mark as Sold**: Should update the `status` field of all selected items to `SOLD`
- **Export CSV**: Should generate and download a CSV file containing only the selected items

## Technical Hints
- The `BulkActionsBar` component is at `app/blocks/inventory-management/bulk-actions-bar.tsx`
- The parent component already tracks `selected` item IDs in state
- For delete/mark-as-sold: submit a hidden `<Form>` with the selected IDs and an `intent` field
- Add `bulk-delete` and `bulk-mark-sold` intents to the existing action in `inventory-management.tsx`
- Use `window.confirm()` for the delete confirmation before form submission

## Difficulty
**Beginner-Intermediate**

## Files to Modify
- `app/blocks/inventory-management/bulk-actions-bar.tsx` (add action handlers)
- `app/routes/inventory-management.tsx` (add bulk action intents to `action()`)
