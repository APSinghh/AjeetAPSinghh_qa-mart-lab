import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';
import { users } from './test-data';

type Account = { email: string; password: string };
type OrderItem = { id: string; qty: number };

// Thin wrapper over the QA Mart API so specs read as intent, not as HTTP plumbing.
export class QaMartApi {
  constructor(private readonly request: APIRequestContext) {}

  async login(account: Account) {
    const res = await this.request.post('/api/login', { data: account });
    return { status: res.status(), body: await res.json() };
  }

  async validateCoupon(code: string, subtotal: number, email: string) {
    const res = await this.request.post('/api/coupons/validate', { data: { code, subtotal, email } });
    return { status: res.status(), body: await res.json() };
  }

  async placeOrder(order: { email: string; items: OrderItem[]; coupon?: string }, token?: string) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await this.request.post('/api/orders', { data: order, headers });
    return { status: res.status(), body: await res.json() };
  }

  // Wipes orders for the whole app. Do not call it from tests that run in parallel with order-placing tests.
  async reset() {
    const res = await this.request.post('/api/test/reset');
    expect(res.ok()).toBeTruthy();
  }
}

export const test = base.extend<{ api: QaMartApi; signedInPage: Page }>({
  api: async ({ request }, use) => {
    await use(new QaMartApi(request));
  },
  signedInPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(users.standard.email);
    await page.getByLabel('Password').fill(users.standard.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/products$/);
    await use(page);
  },
});

export { expect };
