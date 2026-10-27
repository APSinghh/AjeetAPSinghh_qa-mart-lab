# 3. Skills

A skill is a folder with a `SKILL.md` and supporting files. Copilot loads it when its `description` matches the task. Use a skill for a method that needs templates or scripts.

## Story S1: Boundary-value coupon testing
As a tester, I want a method for testing money rules so that coupon thresholds, caps and rounding get boundary cases every time.

**Ingredients**: `docs/stories/US-101-coupon-story.md`, `POST /api/coupons/validate`, `tests/seeded/coupon-boundary.spec.ts`.

**Build.** Create `.github/skills/coupon-boundary-testing/`:
- `SKILL.md` with `name: coupon-boundary-testing` (must match the folder) and a description that says when to use it: "Use when designing or reviewing tests for coupon, discount, threshold or cap rules."
- `rules.md`: a table of each coupon with threshold, cap, rounding and who may use it.
- `template.md`: the data matrix shape (value, expected, why this value).
- Steps in `SKILL.md`: list rules, derive boundaries (n-1, n, n+1, cap-1, cap, cap+1), call the API to confirm, write the matrix, then the spec.

**Done when**
- Ask "design tests for FLAT100" without naming the skill. **References** shows it loaded.
- The matrix includes subtotal 499, 500 and 501. The 500 case exposes the planted bug.
- The result says the failing case is an application bug and does not change `app/`.

## Story S2: Analyse a Playwright failure report
As a tester, I want a skill that reads the JSON report and sorts failures so that I stop scrolling through logs.

**Ingredients**: `reports/results.json` (created by any `npm test`), `exercises/fixtures/sample-results.json`.

**Build.** Create `.github/skills/playwright-failure-analysis/`:
- `SKILL.md`: when to use it, how to run the script, how to classify (application bug, test bug, environment, flaky), what to output.
- `summarize-report.cjs`: a zero-dependency script that takes a report path and prints one line per failed test (file, line, title, first error line without colour codes) and the totals.

**Done when**
- `node .github/skills/playwright-failure-analysis/summarize-report.cjs exercises/fixtures/sample-results.json` lists 5 failures.
- "Why did the last run fail?" makes Copilot run the script and group the failures by likely cause.

## Check yourself
| Symptom | Likely cause |
|---|---|
| Skill never loads | Description lacks the words a user would say; `name` differs from the folder |
| Skill loads but ignores the script | `SKILL.md` does not give the exact command with a relative path |
| Skill is huge | Move detail into side files and link them |
