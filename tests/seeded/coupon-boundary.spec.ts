import { test, expect } from '../fixtures';
import { users, products, coupons } from '../test-data';

// US-101 AC3: FLAT100 gives ₹100 off orders of ₹500 or more. These tests are correct and fail on purpose.
test.describe('FLAT100 boundary (US-101 AC3)', () => {
  test('API: an order of exactly ₹500 gets ₹100 off', async ({ api }) => {
    const { status, body } = await api.validateCoupon(coupons.flat, 500, users.standard.email);
    expect(status).toBe(200);
    expect(body.discount).toBe(100);
  });

  test('UI: one Test Charter Notebook (₹500) with FLAT100 shows ₹100 discount', async ({ signedInPage: page }) => {
    await page
      .getByRole('listitem')
      .filter({ hasText: products.notebook.name })
      .getByRole('button', { name: 'Add to cart' })
      .click();
    await page.goto('/checkout');

    await page.getByLabel('Coupon code').fill(coupons.flat);
    await page.getByRole('button', { name: 'Apply coupon' }).click();

    await expect(page.getByTestId('order-discount')).toHaveText('₹100');
    await expect(page.getByTestId('order-total')).toHaveText('₹400');
  });
});
