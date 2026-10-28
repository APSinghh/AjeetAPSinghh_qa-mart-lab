---
description: "Triage a real QA Mart Playwright failure without weakening the test."
agent: apstest-test-reviewer
argument-hint: "Spec path, command and report or trace path"
---

Analyze ${input:failure:Spec path and exact failing command}.
Read ${input:evidence:Report or trace path} and the installed
apstest-failure-triage skill. Read the relevant story, team conventions and test.
Classify the failure as product, test, environment or insufficient evidence.
Report severity, story/AC, file and line, reproduction command, expected versus
actual, evidence references, and the smallest next discriminating check.
Use docs/templates/bug-report.md for confirmed product defects.
Do not edit files, claim a rerun happened, expose tokens or change assertions
to match planted defects. Clearly distinguish observations from hypotheses.