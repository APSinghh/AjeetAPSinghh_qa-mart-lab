# QA Mart lab (Day 3)

A small shop app plus a Playwright project, for practising locators, Page Objects and AI-assisted authoring.
Everything runs on your machine. The app has no dependencies besides Node.

## 1. Set up (once)
Needs Node.js 20 or newer.

```bash
npm install
npx playwright install chromium
npx playwright test
```
`npx playwright test` starts the app for you (see `webServer` in `playwright.config.ts`) and should end with all tests passed.

## 2. Look around the app
```bash
npm start
```
Open http://localhost:3000 and sign in as `asha@qamart.test` / `Test@1234`.
Use the footer links to switch between the v1 design and the v2 redesign.

## Commands
| Command | What it does |
|---|---|
| `npm start` | Runs QA Mart at http://localhost:3000 (keep it running while you record) |
| `npx playwright test` | Runs your tests (chromium project) |
| `npm run test:ui` | Opens UI mode: watch, time-travel and pick locators |
| `npm run codegen` | Records into `tests/lab/recorded.spec.ts` (needs `npm start` running) |
| `npm run test:v2` | Runs every test, including the legacy suite, against the v2 redesign |
| `npm run test:legacy` | Runs the inherited legacy test once |
| `npm run flaky` | Runs the legacy test 5 times to expose flakiness |
| `npm run report` | Opens the last HTML report |

## Folders
- `app/`: the QA Mart app (do not edit during the lab)
- `pages/`: your Page Objects go here
- `tests/tour/`: working examples to read
- `tests/legacy/`: the inherited script you will review
- `tests/lab/`: your lab tests go here
- `tests/test-data.ts`: accounts and shipping data
- `docs/US-101-coupon-story.md`: the coupon story for the bug bounty
- `.github/copilot-instructions.md`: house rules Copilot reads on every request

## Accounts
asha@qamart.test, ravi@qamart.test, locked@qamart.test. Password for all: `Test@1234`.

## Port 3000 busy?
`PORT=3100 npx playwright test` (macOS/Linux) or `$env:PORT=3100; npx playwright test` (PowerShell). For `npm start`, set PORT the same way.
