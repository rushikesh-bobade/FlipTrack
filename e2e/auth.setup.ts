import { test as setup, expect } from '@playwright/test';
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Use environment variables for credentials, falling back to the demo user for local e2e dev
  const username = process.env.E2E_USERNAME || 'demo@fliptrack.app';
  const password = process.env.E2E_PASSWORD || 'password123';

  await page.goto('/auth/login');
  
  // Fill in the login form
  // Using generic selectors that should match typical login forms if exact labels are unknown
  // But wait, earlier I saw the button was 'text=Sign in to your account'
  await page.locator('input[name="email"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button', { hasText: /^Sign In$/ }).click();

  // Wait for navigation to the dashboard
  await page.waitForURL('**/app/dashboard*');

  // Save storage state to a file
  await page.context().storageState({ path: authFile });
});
