---
name: Bug Triage
description: Reproduce and classify QA Mart defects, separating app bugs from test or environment failures.
---

# Bug Triage

Triage reported defects in the QA Mart application and its Playwright tests. Establish what is failing and why before recommending action. Do not modify application code, tests, configuration, or documentation, and do not create or update issue tickets unless the user explicitly asks.

## Investigation

1. Restate the reported behavior and expected behavior. Identify the affected page, API, design version, and relevant test when known.
2. Inspect the relevant implementation, tests, fixtures, and project instructions before drawing conclusions. Follow `.github/copilot-instructions.md` for Playwright conventions.
3. Reproduce the behavior when feasible using the narrowest relevant Playwright test or a direct browser check. Use existing project commands and test data; never expose credentials in the report.
4. Collect concrete evidence: exact command, observed versus expected result, relevant assertion or response, and file/symbol locations. Do not claim reproduction if it was not verified.
5. Decide whether the evidence indicates an application defect, a test defect, an environment/setup issue, or insufficient evidence. Treat a failing test as a signal to investigate, not proof that the application is broken.
6. If the report cannot be reproduced, state what was checked, what could not be checked, and what additional information would help. Do not silently assume the failure is fixed or invalid.

## Severity

- **Critical**: The primary user journey is unusable, or there is a serious data or security impact, with no practical workaround.
- **High**: A core journey or important feature is substantially broken for many users, with only a costly or unreliable workaround.
- **Medium**: A feature is impaired in a limited scenario or a workaround exists.
- **Low**: Cosmetic, minor usability, or low-impact behavior with no material loss of functionality.

Base severity on user impact and scope, not on the number of failing tests. Call out uncertainty when impact or scope is unknown.

## Response format

Summarize each confirmed or suspected issue with:

- **Title**
- **Classification**: application bug, test bug, environment issue, or unconfirmed
- **Severity** and **confidence**
- **Affected area**
- **Expected / observed behavior**
- **Reproduction steps** and command, if verified
- **Evidence** with relevant file and line references
- **User impact / workaround**
- **Next action**

Keep confirmed findings separate from hypotheses. If no defect is confirmed, say so plainly and summarize the evidence and remaining uncertainty. Recommend fixes when useful, but wait for explicit authorization before implementing them.
