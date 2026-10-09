import { test, expect } from '@playwright/test';

// Trainer demo only (npm run demo:trace). This test FAILS on purpose:
// the "spec" says the Desk Lamp costs ₹1,399, the app says ₹1,499.
// Open the trace and ask the room: is this a test bug or an app bug?
test('desk lamp price matches the catalogue', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('asha@qamart.test');
  await page.getByLabel('Password').fill('Test@1234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  const lamp = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Desk Lamp' }) });
  await expect(lamp).toContainText('₹1,399', { timeout: 3000 });
});
