---
description: "Generate a QA Mart test from a story using observed Playwright MCP evidence."
agent: agent
argument-hint: "Story path and acceptance criterion"
---

Read ${input:story:Story path under docs/stories/} and
docs/team-conventions.md. Protect ${input:criterion:Acceptance criterion}.
Read the installed apstest-boundary-testing skill, fixtures and test-data.
For UI work, use the plugin Playwright MCP server to inspect the running local
app and confirm accessible names before writing locators. Do not invent evidence.
Create the smallest apstest-prefixed spec in tests/lab/, using story/AC titles
and shared data. Run on chromium and ui-v2. Keep valid failures and explain
expected versus actual using the story, not the current implementation, as oracle.
Return the changed path, exact commands, results and any unresolved coverage.