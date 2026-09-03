const { test, expect } = require('@playwright/test');

async function openCreatePurchaseOrderPage(page) {
  await page.goto('/purchase-orders/new');
  await expect(page.getByRole('heading', { name: 'Create Purchase Order' })).toBeVisible();
  await expect(page.locator('.allocation-panel tbody tr').first()).toBeVisible();
}

test.describe('Purchase Order module', () => {
  test('creates and submits a purchase order from approved PR lines', async ({ page }) => {
    await openCreatePurchaseOrderPage(page);

    const vendorName = `PT E2E Supplies ${Date.now()}`;
    const firstLine = page.locator('.allocation-panel tbody tr').first();
    const itemName = await firstLine.locator('td').nth(4).textContent();

    await page.getByLabel('Vendor').fill(vendorName);
    await firstLine.locator('input[aria-label^="Order quantity for"]').fill('1');
    await page.getByRole('button', { name: 'Submit PO' }).click();

    await expect(page.getByRole('status')).toHaveText('Purchase order submitted.');

    await page.goto('/purchase-orders');
    const newOrderRow = page.locator('tbody tr').filter({ hasText: vendorName });
    await expect(newOrderRow).toHaveCount(1);
    await expect(newOrderRow.getByText('SUBMITTED')).toBeVisible();

    await newOrderRow.getByRole('link').click();
    await expect(page.getByRole('heading', { name: 'Detail Purchase Order' })).toBeVisible();
    await expect(page.getByLabel('Vendor')).toHaveValue(vendorName);
    await expect(page.getByText('SUBMITTED')).toBeVisible();
    await expect(page.getByText(itemName.trim())).toBeVisible();
  });

  test('rejects an order quantity greater than the PR line remaining quantity', async ({ page }) => {
    await openCreatePurchaseOrderPage(page);

    const firstLine = page.locator('.allocation-panel tbody tr').first();
    const remainingQuantity = Number(await firstLine.locator('td').nth(8).textContent());
    const orderQuantity = remainingQuantity + 1;

    await page.getByLabel('Vendor').fill('PT Over Allocation Test');
    await firstLine.locator('input[aria-label^="Order quantity for"]').fill(String(orderQuantity));
    await page.getByRole('button', { name: 'Submit PO' }).click();

    await expect(page.getByRole('alert')).toHaveText(
      `lines[0]: allocation qty ${orderQuantity} exceeds remaining ${remainingQuantity}`
    );
    await expect(page).toHaveURL(/\/purchase-orders\/new$/);
    await expect(page.getByRole('heading', { name: 'Create Purchase Order' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveCount(0);
  });
});
