import { test, expect } from './fixtures';

// Seed for the Playwright planner, generator and healer: they run this test to reach a known starting
// state, then copy its style. Starting state: signed in as the standard shopper, on the product list.
test.describe('Seed', () => {
  test('seed: signed-in shopper on the product list', async ({ signedInPage: page }) => {
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });
});
