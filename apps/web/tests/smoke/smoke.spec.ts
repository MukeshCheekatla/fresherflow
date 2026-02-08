import { test, expect } from '@playwright/test';

test('login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
});

test('feed route redirects to login when unauthenticated', async ({ page }) => {
  const response = await page.goto('/dashboard');
  expect(response).not.toBeNull();
  await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
});

test('opportunity detail route is reachable', async ({ page }) => {
  const response = await page.goto('/opportunities/smoke-test-id');
  expect(response).not.toBeNull();
  // The client may redirect/fallback if listing not found; this checks no hard crash.
  await expect(page).toHaveURL(/\/(opportunities|login)/);
});

test('admin opportunities route redirects to admin login when unauthenticated', async ({ page }) => {
  const response = await page.goto('/admin/opportunities');
  expect(response).not.toBeNull();
  await expect(page).toHaveURL(/\/admin\/login/);
});

