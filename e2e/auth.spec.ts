import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Automatically redirects to /api/login
  await expect(page).toHaveURL(/.*login/);
  await expect(page).toHaveTitle(/Login/);
});

test('login requires credentials', async ({ page }) => {
  await page.goto('/api/login');
  await page.click('button[type="submit"]');
  // Built in browser validation will trigger, or our custom error
  // Just checking that we remain on the login page or see an error
  await expect(page).toHaveURL(/.*login/);
});
