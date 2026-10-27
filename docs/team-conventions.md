# Team conventions for QA Mart tests

These are the rules reviewers apply today. They live in people's heads and review comments. Turning them into something Copilot follows automatically is the point of the instructions exercises.

## Layout
- Page Objects: `pages/<Name>Page.ts`, one class per page, default export not used.
- Shared fixtures: `tests/fixtures.ts`. Specs import `test` and `expect` from there when they need `api` or `signedInPage`.
- Specs: `tests/<area>/<feature>.spec.ts`. Lab work goes in `tests/lab/`.
- Test data: `tests/test-data.ts`. Never type an email, password or product price into a spec.

## Locators, in this order
1. `getByRole` with a name
2. `getByLabel`
3. `getByText` for static copy
4. `getByTestId` (`data-testid`) when there is no accessible name
5. CSS only as a last resort, and then ask for a test id instead

Never use XPath, `nth-child`, `.nth()` or generated class names. v2 reorders products and renames classes and ids, but accessible names stay the same.

## Waiting and assertions
- No `waitForTimeout`. Rely on auto-waiting and web-first assertions (`toBeVisible`, `toHaveText`, `toHaveCount`, `toHaveURL`).
- Do not read a value and then assert on it (`textContent()` then `toBe`). Assert on the locator.
- Assertions live in specs, not in Page Objects. A Page Object offers actions and locators.
- One behavior per test. Name tests after the behavior: "FLAT100 gives ₹100 off at exactly ₹500".
- Wrap multi-step flows in `test.step`.

## Credentials and environment
- Credentials come from `tests/test-data.ts`, which reads `QA_USER` and `QA_PASS`.
- Use `baseURL` with relative paths. Never write `http://localhost:3000`.
- Tests must pass on v1 and v2 (`npm run test:v2`).

## When a test fails
- Do not weaken an assertion or edit `app/` to make a test pass.
- If the app is wrong, say so, keep the test, and report it with the bug template in `docs/templates/bug-report.md`.
- Link every test to a story: put the story id (for example `US-101 AC3`) in the describe or test title.

## Before you hand work over
- `npm run typecheck`
- `npm run lint:specs`
- `npm test`
