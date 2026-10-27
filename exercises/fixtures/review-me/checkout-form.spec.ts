import { test, expect } from '@playwright/test';

// Review fixture: checkout validation with duplicated steps and no assertions on the important parts.
// Used by the test-reviewer exercise (A2).
test.describe('checkout form', () => {
  test('mobile and pin validation', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('asha@qamart.test');
    await page.getByLabel('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('listitem').first().getByRole('button').click();
    await page.goto('/checkout');
    await page.getByLabel('Full name').fill('Asha');
    await page.getByLabel('Mobile number').fill('123');
    await page.getByLabel('PIN code').fill('0123');
    await page.getByRole('button', { name: 'Place order' }).click();
    await page.screenshot({ path: 'checkout.png' });
  });

  test('place order', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('asha@qamart.test');
    await page.getByLabel('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('listitem').first().getByRole('button').click();
    await page.goto('/checkout');
    await page.getByLabel('Full name').fill('Asha Rao');
    await page.getByLabel('Mobile number').fill('9876543210');
    await page.getByLabel('Delivery address').fill('12 MG Road');
    await page.getByLabel('PIN code').fill('560001');
    await page.getByRole('button', { name: 'Place order' }).click();
    expect(page.url()).toContain('confirmation');
  });
});
