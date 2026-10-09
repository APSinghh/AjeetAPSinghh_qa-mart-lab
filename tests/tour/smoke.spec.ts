import { test, expect } from '@playwright/test';
import { users } from '../test-data';

// Setup check: if these pass, your lab project works.
test.describe('QA Mart smoke', () => {
  test('sign-in page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to QA Mart' })).toBeVisible();
  });

  test('standard user reaches the product list', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(users.standard.email);
    await page.getByLabel('Password').fill(users.standard.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/products$/);
    // Web-first assertion: retries until the slow product list has loaded.
    await expect(page.getByRole('list', { name: 'Products' }).getByRole('listitem')).toHaveCount(6);
  });
});
