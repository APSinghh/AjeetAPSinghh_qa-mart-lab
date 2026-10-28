---
description: "Use when creating or updating QA Mart page objects."
applyTo: "**/pages/**/*.ts"
---

Follow docs/team-conventions.md. Use pages/apstest<Name>Page.ts for new files,
named exports and one page class per file. Accept a Playwright Page in the
constructor; expose intention-revealing actions and reusable Locator properties.
Inspect accessible roles and names using Playwright MCP before selecting controls.
Use role/name, label, static text or test id, in that order. Do not select by
position, CSS class, generated id or XPath: UI v2 deliberately changes these.
No assertions, test data, embedded credentials, fixed sleeps or network resets
in page objects. Assertions and story references belong in specs. Actions may
wait for meaningful state using Playwright auto-waiting, not arbitrary delays.
Never add page objects solely to wrap a single trivial locator used once.