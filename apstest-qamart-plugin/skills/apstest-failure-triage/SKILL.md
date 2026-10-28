---
name: apstest-failure-triage
description: "Use when analyzing QA Mart Playwright failures, traces, reports/results.json, seeded defects, v1/v2 locator regressions or flaky tests."
---

# Evidence-Based Failure Triage

1. Read the exact failing command, project, spec, story/AC and
   docs/team-conventions.md. If no results exist, say not run; do not fabricate.
2. Parse Playwright JSON reports with JSON.parse, not regular expressions.
   Locate the matching test and attempt; distinguish expected failures,
   unexpected results, skipped cases and retries. Do not equate retries with proof
   of flakiness. Compare the latest attempt with prior attempts and timestamps.
3. Read the first actionable assertion error and available attachment paths.
   Never paste trace internals, bearer tokens or login request bodies into reports.
4. Separate the oracle from observations. A 201 without a token is a US-105
   product security defect, not permission to change the expected 401. A v2-only
   CSS locator failure is probably a test issue. Missing browser binaries or
   ECONNREFUSED are environment evidence, not product defects.
5. Identify one hypothesis and one cheap check that could disprove it. The
   read-only reviewer must suggest the rerun command, not execute or edit.
   An authorized author may run the single test with the original project and
   --trace on. Use Playwright MCP snapshots for UI observations when needed.
6. Follow docs/templates/bug-report.md for confirmed product defects. Include
   severity, story/AC, exact command, expected/actual, file/line, report/trace path,
   confidence and remaining gaps. Never weaken assertions, change app/, add sleeps
   or mask failure with extra retries. Redact personal and authentication data.