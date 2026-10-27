# Planted bugs (trainer only)

Do not share this file before the exercises. Each bug is covered by a failing test in `tests/seeded/` (`npm run test:seeded`).

| # | Bug | Where | Story | Seeded test |
|---|---|---|---|---|
| B1 | FLAT100 needs `subtotal > 500` instead of `>= 500` | `app/server.js` `validateCoupon` | US-101 AC3 | `coupon-boundary.spec.ts` (API and UI, 2 tests) |
| B2 | WELCOME50 still works after the shopper has ordered; only the account flag is checked | `app/server.js` `validateCoupon` | US-101 AC4 | `welcome50-reuse.spec.ts` |
| B3 | `POST /api/orders` accepts requests with no sign-in token and does not match token to email (should be 401 and 403) | `app/server.js` orders route | US-105 | `order-security.spec.ts` |
| B4 | Stock is only checked for products with 0 stock; quantity above the limit is accepted | `app/server.js` orders route | US-103 AC3 | `stock-limit.spec.ts` |

Expected result of `npm run test:seeded`: **5 failed** (B1 counts twice).

Other deliberate weaknesses
- `tests/legacy/legacy-checkout.spec.ts`: hard waits, XPath, positional and CSS selectors, hard-coded credentials and URL. Breaks on v2. `npm run flaky` exposes it.
- `tests/tour/trace-demo.spec.ts`: wrong Desk Lamp price on purpose (`npm run demo:trace`).
- `exercises/fixtures/review-me/`: three specs with the problems the reviewer agent should find.
- Products load with a random 300-1700 ms delay.

## Fixing a bug in the demo
Fixing B1 means changing `>` to `>=` in `validateCoupon`. Do it live only to show that the seeded tests go green; revert before the next group (`git checkout app/server.js`).

## Heads up
- A fixed B3 requires tokens on `POST /api/orders`; the tour tests already sign in first, so they keep passing. The UI does not send a token, so fixing B3 also needs the checkout page to send one.
- Port 3000 can be taken by another process on a trainee's machine. `reuseExistingServer` then points the tests at the wrong server. Have them set `PORT`.
