import { test, expect } from '@playwright/test';

test('application loads and displays dashboard for authenticated user', async ({ page }) => {
  await page.goto('/app/dashboard');
  
  // Verify we are not redirected to login
  await expect(page).toHaveURL(/.*\/app\/dashboard/);
  
  // Verify dashboard content is visible
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
});
