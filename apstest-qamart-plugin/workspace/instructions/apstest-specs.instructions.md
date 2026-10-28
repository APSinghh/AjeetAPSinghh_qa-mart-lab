---
description: "Use when writing or reviewing QA Mart Playwright specs."
applyTo: "**/tests/**/*.spec.ts"
---

Read docs/team-conventions.md and the relevant docs/stories/US-*.md first.
Link each behavior to a story and AC in its title. Lab specs belong in tests/lab/.
Reuse test and expect from tests/fixtures.ts when using api or signedInPage.
Use tests/test-data.ts for accounts, products and prices; use relative URLs.
Prefer role/name, label, static text, then test id. No XPath, positional selectors,
generated classes, fixed sleeps, force clicks or soft assertions masking failures.
Use web-first locator assertions and test.step for multi-step flows.
Keep assertions in specs, not page objects. One behavior per test.
Never reset shared orders during parallel tests; use an isolated app for destructive checks.
Do not edit app/, skip failing tests, or change expected results to match planted bugs.
Prefix new test files with apstest. Run touched specs on chromium and ui-v2.