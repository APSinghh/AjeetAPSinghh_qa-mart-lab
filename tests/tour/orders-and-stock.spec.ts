import { test, expect } from '../fixtures';
import { users, products } from '../test-data';

test.describe('Orders and stock', () => {
  test('a sold-out product cannot be added to the cart', async ({ signedInPage: page }) => {
    const card = page.getByRole('listitem').filter({ hasText: products.stand.name });
    await expect(card.getByText('Out of stock')).toBeVisible();
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeDisabled();
  });

  test('an API order for a sold-out product is rejected', async ({ api }) => {
    const login = await api.login(users.returning);
    const { status, body } = await api.placeOrder(
      { email: users.returning.email, items: [{ id: products.stand.id, qty: 1 }] },
      login.body.token,
    );
    expect(status).toBe(422);
    expect(body.error).toBe('Laptop Stand is out of stock');
  });

  test('order history lists an order the shopper placed', async ({ api, page }) => {
    const login = await api.login(users.returning);
    const { body: order } = await api.placeOrder(
      { email: users.returning.email, items: [{ id: products.cable.id, qty: 2 }] },
      login.body.token,
    );

    await page.goto('/login');
    await page.getByLabel('Email').fill(users.returning.email);
    await page.getByLabel('Password').fill(users.returning.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('link', { name: 'Orders' }).click();

    await expect(page.getByRole('heading', { name: 'Order history' })).toBeVisible();
    const row = page.getByRole('row').filter({ hasText: order.orderId });
    await expect(row.getByRole('cell').last()).toHaveText('₹498');
  });

  test('order history needs a sign-in token', async ({ request }) => {
    const res = await request.get('/api/orders');
    expect(res.status()).toBe(401);
  });
});
