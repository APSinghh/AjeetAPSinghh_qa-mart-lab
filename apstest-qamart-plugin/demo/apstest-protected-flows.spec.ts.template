import { test, expect } from '../fixtures';
import { users, products, coupons } from '../test-data';

test('US-101 AC2: SAVE10 discounts a notebook subtotal by ten percent', async ({ api }) => {
  const { status, body } = await api.validateCoupon(
    coupons.percent, products.notebook.price, users.standard.email,
  );
  expect(status).toBe(200);
  expect(body.discount).toBe(Math.floor(products.notebook.price * 0.1));
});

test('US-103 AC1: a sold-out product cannot be added to the cart', async ({ signedInPage: page }) => {
  const product = page.getByRole('listitem').filter({ hasText: products.stand.name });
  await expect(product.getByText('Out of stock')).toBeVisible();
  await expect(product.getByRole('button', { name: 'Add to cart' })).toBeDisabled();
});

test('US-105 AC3: a matching email and token create an order with correct totals', async ({ api }) => {
  const login = await api.login(users.returning);
  expect(login.status).toBe(200);
  expect(login.body.token).toEqual(expect.any(String));
  const { status, body } = await api.placeOrder({
    email: users.returning.email,
    items: [{ id: products.cable.id, qty: 1 }],
  }, login.body.token);
  expect(status).toBe(201);
  expect(body.orderId).toEqual(expect.stringMatching(/^QM-\d+$/));
  expect(body.subtotal).toBe(products.cable.price);
  expect(body.discount).toBe(0);
  expect(body.total).toBe(products.cable.price);
});