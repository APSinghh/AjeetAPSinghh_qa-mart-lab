---
name: 'Playwright specs'
description: 'Use when writing or changing Playwright spec files for QA Mart in tests/.'
applyTo: 'tests/**/*.spec.ts'
---
# Playwright specs

- Import `test` and `expect` from `tests/fixtures.ts` when you need the `api` or `signedInPage` fixtures, otherwise from `@playwright/test`.
- Put the story id in the describe or test title, for example `US-101 AC3: FLAT100 at exactly ₹500`.
- Emails, passwords and prices come from `tests/test-data.ts`.
- Use `test.step` to label each stage of a multi-step flow.
- One behavior per test. Do not share state between tests; each test sets up what it needs.
- If a correct test fails because the app is wrong, keep the test, do not weaken it, and report the bug with `docs/templates/bug-report.md`. Never edit `app/` to make a test pass.
- Before finishing run `npm run typecheck` and `npm run lint:specs`.
