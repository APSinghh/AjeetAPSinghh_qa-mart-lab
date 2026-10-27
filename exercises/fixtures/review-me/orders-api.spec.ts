import { test, expect } from '@playwright/test';

// Review fixture: API checks with weak assertions and shared state. Used by the test-reviewer exercise (A2).
let token: string;

test('login', async ({ request }) => {
  const res = await request.post('/api/login', { data: { email: 'ravi@qamart.test', password: 'Test@1234' } });
  token = (await res.json()).token;
  expect(token).toBeTruthy();
});

test('order and history', async ({ request }) => {
  const order = await request.post('/api/orders', {
    data: { email: 'ravi@qamart.test', items: [{ id: 'p1', qty: 1 }, { id: 'p2', qty: 1 }] },
  });
  expect(order.ok()).toBeTruthy();

  const history = await request.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
  expect(history.ok()).toBeTruthy();
  const body = await history.json();
  expect(body.orders.length).toBeGreaterThan(0);
  expect(body.orders[0].total).toBe(1048);
});

test('locked account', async ({ request }) => {
  const res = await request.post('/api/login', { data: { email: 'locked@qamart.test', password: 'Test@1234' } });
  expect(res.status()).not.toBe(200);
});
