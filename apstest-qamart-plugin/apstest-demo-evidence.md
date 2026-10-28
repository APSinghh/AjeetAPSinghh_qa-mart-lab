# apstest Capstone Evidence

## Project Analysis

QA Mart is a Node-served storefront with browser JavaScript, a documented JSON
API and a TypeScript Playwright suite. Tests share `tests/fixtures.ts` and
`tests/test-data.ts`. `docs/team-conventions.md` requires semantic locators,
web-first assertions, shared credentials/data and story-linked tests.
The `ui-v2` project changes presentation to expose brittle selectors. Seeded
defects and legacy/demo suites are separate from the default project.

Chosen flows and risks:

| Flow | Oracle | Main risk | Starter proof |
| --- | --- | --- | --- |
| Coupon application | US-101 | Rounding/caps/inclusive FLAT100 threshold | SAVE10 exact discount |
| Stock limits | US-103 | Zero stock, quantity off-by-one, unstable UI locators | Disabled sold-out control on v1/v2 |
| Secure ordering | US-105 | Missing token, mismatched identity, incorrect totals | Matching token/email creates correct order |

Global order reset in the shared fixture is unsafe during parallel order tests.
The demo never resets state and uses a returning shopper for order creation.
The boundary skill adds negative and threshold matrices; the starter demo is
not a claim that those negative cases have been executed or fixed.

The lab's plugin exercise explicitly separates workspace instructions/prompts
from native plugin components. This package follows that boundary and provides
an installer instead of unsupported manifest keys.

## Observed Runs

Local verification on 2026-10-28, Node.js 24.21.0 / npm 11.19.0:

| Check | Observed result |
| --- | --- |
| `npm ci` | Installed locked lab dependencies; zero reported vulnerabilities |
| Initial installer tests | Passed repeat install and no-overwrite checks |
| Final package verification | 7 passed, including dangling-symlink rejection and fail-closed malformed input |
| Relocated clean-package test | Passed copy into a temporary directory, workspace registration, 2 instructions, 2 prompts, 2 skills, 2 agents, MCP config, 2 hooks, optional demo |
| Guard and post-edit checks | Passed protected edits, patch payloads, symlinks, shell approval and lint pass/fail feedback |
| `npm run typecheck` | Passed |
| `npm run lint:specs` | Passed: 11 files, no findings |
| Focused demo, chromium and ui-v2, port 3217 | 6 passed |
| `PORT=3218 npm test` | 15 passed |
| Playwright MCP initialize / tools/list | Passed; server Playwright, 25 tools |
| Real MCP login-page navigation and snapshot | Passed; Email, Password and Sign in found |
| MCP isolated browser close | Passed |

The first MCP browser launch failed because MCP needed Chromium revision 1247
while the runner had installed 1248. After
`npx -y @playwright/mcp@0.0.83 install-browser chromium`, the same check passed.
This prerequisite is now documented in the install guide.

Browser output uses plugin data storage; the smoke check substitutes a temporary
directory and removes it. No browser snapshots are included in the submission.

Playwright writes its current JSON report to `reports/results.json` and HTML
report to `playwright-report/`; subsequent test commands overwrite these.
They are lab-ignored runtime artifacts, not bundled submission files.

## Still Manual

Opening the generated workspace, confirming discovery in the VS Code UI,
observing real lifecycle hook activation during a new Copilot session, and
testing enable/disable behavior require the interactive checklist in
`apstest-README.md`. Automated hook tests exercise real scripts and contracts;
they do not prove that the current editor has enabled the plugin.

No GitHub publication or clean-profile UI installation is claimed. Publish the
plugin directory to your own repository, repeat the interactive checklist on a
clean VS Code profile, and add the actual repository link before submission.