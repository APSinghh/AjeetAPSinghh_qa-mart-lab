import { test, expect } from '@playwright/test';

// The request fixture talks to the API directly: no browser, fast and stable.
test.describe('QA Mart API', () => {
  test('lists six products', async ({ request }) => {
    const res = await request.get('/api/products');
    expect(res.ok()).toBeTruthy();
    const { products } = await res.json();
    expect(products).toHaveLength(6);
    expect(products).toContainEqual({ id: 'p1', name: 'Wireless Mouse', price: 799 });
  });

  test('rejects a wrong password with 401', async ({ request }) => {
    const res = await request.post('/api/login', { data: { email: 'asha@qamart.test', password: 'wrong' } });
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ error: 'Invalid email or password' });
  });

  // Data-driven: one test per row.
  const coupons = [
    { code: 'SAVE10', subtotal: 799, discount: 79 },
    { code: 'save10 ', subtotal: 3498, discount: 200 },
    { code: 'FLAT100', subtotal: 1000, discount: 100 },
  ];
  for (const { code, subtotal, discount } of coupons) {
    test(`coupon "${code}" on ₹${subtotal} gives ₹${discount} off`, async ({ request }) => {
      const res = await request.post('/api/coupons/validate', { data: { code, subtotal, email: 'asha@qamart.test' } });
      expect(res.status()).toBe(200);
      expect((await res.json()).discount).toBe(discount);
    });
  }
});
