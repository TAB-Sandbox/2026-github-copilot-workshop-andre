const { test, expect } = require('@playwright/test');

test.describe('Goods Receipt module', () => {
  test('creates and posts a receipt from a submitted purchase order', async ({ page }) => {
    await page.goto('/purchase-orders/new');
    await expect(page.getByRole('heading', { name: 'Create Purchase Order' })).toBeVisible();
    await expect(page.locator('.allocation-panel tbody tr').first()).toBeVisible();

    const vendorName = `PT GR E2E Supplies ${Date.now()}`;
    const firstLine = page.locator('.allocation-panel tbody tr').first();
    await page.getByLabel('Vendor').fill(vendorName);
    await firstLine.locator('input[aria-label^="Order quantity for"]').fill('1');
    await page.getByRole('button', { name: 'Submit PO' }).click();
    await expect(page.getByRole('status')).toHaveText('Purchase order submitted.');

    await page.goto('/purchase-orders');
    const orderRow = page.locator('tbody tr').filter({ hasText: vendorName });
    await orderRow.getByRole('link').click();
    await expect(page.getByRole('link', { name: 'Receive Goods' })).toBeVisible();
    await page.getByRole('link', { name: 'Receive Goods' }).click();

    await expect(page.getByRole('heading', { name: 'Create Goods Receipt' })).toBeVisible();
    await page.getByRole('button', { name: 'Create Draft Receipt' }).click();
    await expect(page).toHaveURL(/\/goods-receipts\/[^/]+$/);
    await expect(page.getByText('DRAFT')).toBeVisible();

    await page.getByRole('button', { name: 'Post Receipt' }).click();
    await expect(page.getByText('POSTED')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Post Receipt' })).toHaveCount(0);
  });
});
