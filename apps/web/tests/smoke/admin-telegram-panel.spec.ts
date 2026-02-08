import { expect, test } from '@playwright/test';

const adminStorageState = process.env.ADMIN_STORAGE_STATE;

test.describe('admin telegram panel', () => {
  test.skip(!adminStorageState, 'Set ADMIN_STORAGE_STATE to run admin telegram panel e2e.');
  test.use({ storageState: adminStorageState });

  test('loads telegram panel and shows filters', async ({ page }) => {
    await page.goto('/admin/telegram');
    await expect(page.getByRole('heading', { name: 'Telegram' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Failed' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Skipped' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sent' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
  });
});

