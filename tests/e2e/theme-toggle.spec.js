import { test, expect } from '@playwright/test';

test.describe('theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toggles between light and dark mode', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle dark mode' });
    await expect(toggle).toBeVisible();

    // Default is light mode
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Click to switch to dark mode
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Click to switch back to light mode
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
