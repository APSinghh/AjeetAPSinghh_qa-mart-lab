import { test, expect } from '@playwright/test';

// Inherited from the old Selenium suite and "ported" line by line.
// It works... most of the time. Your job in the lab: review it and say Keep, Fix or Kill.
test('checkout - legacy', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('#email', 'asha@qamart.test');
  await page.fill('#password', 'Test@1234');
  await page.click('#login-btn');

  await page.waitForTimeout(1000); // "wait for products"
  const count = await page.locator('.product-card').count();
  expect(count).toBe(6);

  await page.click('//ul/li[1]/button'); // Wireless Mouse
  await page.click('.product-grid > li:nth-child(3) .btn-primary'); // Test Charter Notebook
  await page.click('.cart-badge');

  const subtotal = await page.textContent('[data-testid="cart-subtotal"]');
  expect(subtotal).toBe('₹1,299');

  await page.click('text=Checkout');
  await page.fill('#full-name', 'Asha Rao');
  await page.fill('#mobile', '9876543210');
  await page.fill('#address', '12 MG Road, Bengaluru');
  await page.fill('#pin', '560001');
  await page.click('.btn-primary');

  await page.waitForTimeout(2000);
  expect(page.url()).toContain('confirmation');
});
