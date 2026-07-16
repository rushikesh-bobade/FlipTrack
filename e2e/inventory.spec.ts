import { test, expect } from '@playwright/test';

test.describe('Inventory Management', () => {
  test('can create a new inventory item', async ({ page }) => {
    // Generate a unique item name to avoid collisions with existing data
    const uniqueId = Date.now();
    const itemName = `E2E Test Sneaker ${uniqueId}`;
    const itemSku = `E2E-${uniqueId}`;

    // Navigate to inventory page
    await page.goto('/app/inventory');
    await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible();

    // Open the Add Item modal via the header button (use .first() to distinguish from the always-mounted form submit button)
    await page.getByRole('button', { name: 'Add Item' }).first().click();

    // Verify modal opened — the modal title "Add Inventory Item" should be visible
    await expect(page.getByText('Add Inventory Item')).toBeVisible();

    // ── Step 0: Basic Info ──
    // Labels lack for/id pairing, so we target inputs by their name attribute.
    await page.locator('input[name="sku"]').fill(itemSku);
    await page.locator('input[name="name"]').fill(itemName);
    await page.locator('input[name="brand"]').fill('TestBrand');
    await page.locator('input[name="size"]').fill('10');
    await page.getByRole('button', { name: 'Next' }).click();

    // ── Step 1: Purchase Details ──
    await page.locator('input[name="purchasePrice"]').fill('150');
    await page.locator('input[name="purchaseDate"]').fill('2025-01-15');
    await page.getByRole('button', { name: 'Next' }).click();

    // ── Step 2: Marketplace (optional fields — skip) ──
    // Submit the form. On step 2, the submit button reads "Add Item".
    await page.getByTestId('submit-add-item').click();

    // Verify success toast appears (sonner toast)
    await expect(page.getByText('Item added successfully')).toBeVisible();

    // Verify the newly created item appears in the inventory table as a link
    await expect(page.getByRole('link', { name: itemName })).toBeVisible();
  });
});
