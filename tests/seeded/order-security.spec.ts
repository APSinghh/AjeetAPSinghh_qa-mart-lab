import { test, expect } from '../fixtures';
import { users, products } from '../test-data';

// Placing an order is a signed-in action: no token means no order.
test('POST /api/orders without a sign-in token is rejected with 401', async ({ api }) => {
  const { status } = await api.placeOrder({
    email: users.standard.email,
    items: [{ id: products.mug.id, qty: 1 }],
  });
  expect(status).toBe(401);
});
