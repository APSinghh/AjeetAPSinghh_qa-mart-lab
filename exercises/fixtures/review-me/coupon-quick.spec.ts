import { test, expect } from '@playwright/test';

// Review fixture: coupon flow written in a hurry. Used by the test-reviewer exercise (A2).
test('coupon works', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('#email', 'asha@qamart.test');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type=submit]');
  await page.waitForTimeout(3000);

  await page.locator('.product-card').nth(2).locator('button').click();
  await page.goto('http://localhost:3000/checkout');
  await page.fill('#coupon', 'save10');
  await page.click('text=Apply coupon');
  await page.waitForTimeout(1000);

  const discount = await page.textContent('[data-testid="order-discount"]');
  expect(discount).not.toBe('₹0');
});
