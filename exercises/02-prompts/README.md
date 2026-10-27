# 2. Prompts

A prompt file is one task you start by typing `/name`. You invoke it; it is not applied automatically.

**Harness**: select **Local** in Chat. Prompt files run only there. (In other harnesses, build a skill instead.)

## Story P1: Test cases and a spec from a story
As a tester, I want to type `/test-from-story` with a story id so that I get a test-case table and a first Playwright spec without rewriting the same prompt every time.

**Ingredients**: `docs/stories/US-10x-*.md`, `docs/templates/test-case.md`, `tests/fixtures.ts`, `tests/test-data.ts`.

**Build.** Create `.github/prompts/test-from-story.prompt.md`.
- Frontmatter: `description`, `argument-hint` (for example `story id such as US-103`), `agent: agent`.
- Body: read the story, produce a table in the `test-case.md` format (one row per acceptance criterion, name the technique), then write a spec in `tests/lab/<story-id>.spec.ts` using the fixtures and test data.
- Ask for the story with `${input:story:US-103}` or take it from the user message.

**Done when**
- `/test-from-story US-103` creates a table plus a spec.
- `npm run typecheck && npm run lint:specs` pass on the generated spec.
- Tests that fail because of an app bug are kept and reported, not weakened.

## Story P2: A bug report from a failing test
As a tester, I want `/bug-report` to turn a failing test into a report in our template so that every report has the same evidence.

**Ingredients**: `npm run test:seeded`, `docs/templates/bug-report.md`, `reports/results.json`.

**Build.** Create `.github/prompts/bug-report.prompt.md`.
- Restrict `tools` to read, search and terminal so the prompt cannot edit files.
- Body: run the named failing spec, read the failure, fill the template, separate confirmed facts from guesses, classify as application bug, test bug, environment issue or unconfirmed.

**Done when**
- `/bug-report tests/seeded/stock-limit.spec.ts` returns a report with exact status codes, the story id and a file reference.
- It does not edit any file.

## Check yourself
| Symptom | Likely cause |
|---|---|
| `/name` does not appear | Not in `.github/prompts/` or the harness is not Local |
| Prompt edits files you wanted left alone | No `tools` restriction |
| Different output every run | Body asks for a result but gives no format |
