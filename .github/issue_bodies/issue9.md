## Description
FlipTrack has no user feedback system for CRUD operations. When a user adds an inventory item, deletes a sale, saves preferences, or triggers any action — there is no visible success/error notification. The page silently reloads with no confirmation, leaving users unsure if their action worked.

## Expected Behavior
A toast notification system should appear in the corner of the screen providing instant feedback:
- ✅ **Success**: "Item added successfully", "Sale deleted", "Preferences saved"
- ❌ **Error**: "Failed to delete item", "Invalid form data"
- ⚠️ **Warning**: "Are you sure you want to delete?"

Toasts should auto-dismiss after 3-5 seconds and be stackable.

## Technical Hints
- Consider using `sonner` (lightweight, beautiful) or `react-hot-toast` — both work great with React Router
- Create a `<Toaster />` component in `app/root.tsx` so it's available globally
- Use React Router's `useActionData()` to detect action results and trigger toasts
- Style the toasts using FlipTrack's CSS variable system (`var(--color-success)`, `var(--color-danger)`) for theme consistency

## Difficulty
**Beginner-Intermediate**

## Files to Modify
- `app/root.tsx` (add global Toaster provider)
- `package.json` (add toast library)
- Various route files where `action()` returns results (inventory, sales, settings, etc.)
