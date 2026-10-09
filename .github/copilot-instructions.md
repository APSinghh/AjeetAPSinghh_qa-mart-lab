# Copilot instructions: QA Mart Playwright tests

These rules hold the S (situation) and T (terms) of a TESTER prompt for this repo, so every Copilot request starts from them.

## Situation
- App under test: QA Mart, a small shop served by `app/server.js` at http://localhost:3000.
- Stack: Playwright Test (TypeScript), version 1.64. Chromium is the default project.
- Pages: /login, /products, /cart, /checkout, /confirmation. API: /api/login, /api/products, /api/coupons/validate, /api/orders.
- The UI has a "v2 redesign" (`npm run test:v2`) that changes CSS classes, ids, DOM nesting and product order. Accessible names do not change.

## Terms (follow these every time)
- Page Objects live in `pages/<Name>Page.ts`, one class per page. Locators are `readonly` fields set in the constructor. Actions are `async` methods.
- Shared fixtures live in `tests/fixtures.ts` via `test.extend`. Tests import `test` and `expect` from `./fixtures` (or `../fixtures`).
- Locator priority: `getByRole` > `getByLabel` > `getByText` > `getByTestId`. Never use CSS classes, ids, XPath, or `nth()` / `first()` to pick a product; scope with `filter({ has: ... })` by the product name.
- Use web-first assertions (`await expect(locator).toHaveText(...)`). Never use `page.waitForTimeout`, and never read state with `count()`, `textContent()` or `isVisible()` and then assert on the value.
- Credentials and test data come from `tests/test-data.ts`. Never hard-code passwords in a spec.
- Keep assertions in tests, not in Page Objects. Every test asserts something the user can see.
- Use `test.step` to group long flows. Keep test titles as plain sentences.
- Never weaken or delete an assertion to make a test pass. If a test reveals an app bug, say so.
