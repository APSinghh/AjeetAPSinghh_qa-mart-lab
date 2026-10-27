import { test, expect } from '../fixtures';
import { users, products, coupons } from '../test-data';

// US-101 AC4: WELCOME50 is for a shopper's first order only.
test('US-101 AC4: WELCOME50 is rejected once the shopper has placed an order', async ({ api }) => {
  const login = await api.login(users.standard);
  const order = await api.placeOrder(
    { email: users.standard.email, items: [{ id: products.mouse.id, qty: 1 }] },
    login.body.token,
  );
  expect(order.status).toBe(201);

  const { status, body } = await api.validateCoupon(coupons.firstOrder, products.mouse.price, users.standard.email);
  expect(status).toBe(422);
  expect(body.message).toBe('WELCOME50 is for your first order only');
});
