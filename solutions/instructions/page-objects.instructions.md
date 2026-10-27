---
name: 'Page Objects'
description: 'Use when creating or editing Page Object classes for QA Mart in pages/.'
applyTo: 'pages/**/*.ts'
---
# Page Objects

- One class per page, file `pages/<Name>Page.ts` (for example `LoginPage.ts`), named export.
- Constructor takes a Playwright `Page`. Expose locators as readonly properties and user actions as methods (`signIn(email, password)`).
- Locators follow `docs/team-conventions.md`: role, label, text, test id. No XPath, no CSS classes, no positional selectors.
- No `expect` in a Page Object. Specs own the assertions, so a failing test says what the behavior was.
- No `waitForTimeout`. Actions rely on auto-waiting.
- Never hard-code credentials or URLs: take them as arguments, and navigate with relative paths (`/login`).
- Accessible names are the same in v1 and v2, so a Page Object built on them works in both designs.
