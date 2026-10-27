import { test, expect } from '../fixtures';
import { users, products } from '../test-data';

// Stock is the most units of a product one order may contain (see GET /api/inventory).
test('US-103 AC3: an order above the stock limit is rejected with 422', async ({ api }) => {
  const login = await api.login(users.standard);
  const { status, body } = await api.placeOrder(
    { email: users.standard.email, items: [{ id: products.lamp.id, qty: products.lamp.stock + 1 }] },
    login.body.token,
  );
  expect(status).toBe(422);
  expect(body.error).toContain('Desk Lamp');
});
