# 4. Custom agents

A custom agent is a role: its own instructions, its own tool list, optionally a model, and handoffs to other agents. Use one when a task needs a different set of tools or an isolated context.

**Start with A3 in the session.** It uses agents Playwright already provides, so you see a working multi-agent loop immediately. A1 and A2 are the take-home: agents you design from scratch.

## Story A1: A planner that cannot edit
As a QA lead, I want a test planner that turns a story into a plan and then hands off to implementation, so that nobody starts coding before the plan is reviewed.

**Ingredients**: `docs/stories/`, `docs/templates/test-case.md`, `docs/team-conventions.md`.

**Build.** Create `.github/agents/test-planner.agent.md`.
- Frontmatter: `name`, `description`, `tools: ['read', 'search']` (no edit, no terminal).
- Body: restate the story, list risks, produce the test-case table, say which cases are UI and which are API, name the fixtures to use, stop. Do not write code.
- Add a handoff: `label: Write the specs`, `agent: agent`, `send: false`, with a prompt that carries the plan forward.

**Done when**
- Select Test Planner, ask for a plan for US-105. You get a plan and no file changes.
- The handoff button appears and pre-fills the implementation prompt.
- Trying to make it edit a file fails because the tool is not available.

## Story A2: A reviewer that finds what review would find
As a reviewer, I want an agent that checks a spec against our conventions and reports findings by severity, so that I review in minutes.

**Ingredients**: `exercises/fixtures/review-me/*.spec.ts`, `docs/team-conventions.md`, `npm run lint:specs`.

**Build.** Create `.github/agents/test-reviewer.agent.md`.
- Tools: read, search and terminal (so it may run `npm run lint:specs <file>`).
- Output format: findings table (file, line, rule, severity, fix), then a verdict of approve or request changes.
- Allow other agents to call it as a subagent (leave model invocation enabled).

**Done when**
- Review `exercises/fixtures/review-me/coupon-quick.spec.ts`: it reports the hard waits, positional selector, CSS ids, hard-coded URL and credentials, and the read-then-assert pattern.
- It also finds problems the lint script cannot (for example: no story reference, shared state between tests in `orders-api.spec.ts`).
- It does not edit the file.

## Story A3: Playwright test agents, adapted to our rules
As a QA lead, I want Playwright's own planner, generator and healer agents to follow our stories and conventions, so that AI-written tests are traceable to a story and never "healed" into agreeing with a bug.

Playwright ships three custom agents, generated into your repository. They are normal `.agent.md` files plus an MCP server (`playwright-test`) that drives a real browser. Regenerate them whenever Playwright is updated. Needs VS Code 1.105 or newer.

| Agent | Reads | Writes |
|---|---|---|
| planner | the running app, `tests/seed.spec.ts`, optional requirements | a Markdown plan in `specs/` |
| generator | the plan | spec files in `tests/` |
| healer | the failing test | a fixed test, or `test.fixme()` when it thinks the app is broken |

**Ingredients**: `tests/seed.spec.ts` (already in the repo: signed in, on the product list), `specs/` (plans), `docs/stories/`, `npm run test:seeded`.

**Build, in three steps**
1. Generate: `npx playwright init-agents --loop=vscode`. Look at what appeared: `.github/agents/playwright-test-*.agent.md` and `.vscode/mcp.json` (also a `.github/workflows` file for the cloud agent, which you can delete). Open each agent and read its `tools` list and its rules. The generated files pin `model: Claude Sonnet 4.6`; if your Copilot plan does not offer that model, delete the line (the reference versions in `solutions/playwright-agents/agents/` do).
2. Run the loop on **US-103**: ask the planner for a plan from `docs/stories/US-103-stock-limits.md`, hand off to the generator, then run what it wrote.
3. Adapt them. Edit the generated agents (they are yours now, but a regenerate overwrites them, so keep the edits small and re-apply them):
   - Planner: read the story and `docs/team-conventions.md` first, cite acceptance criteria, save as `specs/<story-id>.md`, add a handoff to the generator.
   - Generator: import from `tests/fixtures.ts`, use `signedInPage`, put the story id in each title, run `npm run typecheck` and `npm run lint:specs`, add a handoff to the healer.
   - Healer: this one matters most. Read what it does today: it may "fix assertions and expected values". Point it at `npm run test:seeded` and watch what it does to the planted bugs. Then add guardrails: it may fix locators, waits and data, never expected values, never `app/`; when the test matches the story it must use `test.fixme()` with a `BUG:` comment and report the bug.
4. Put the seeded tests back before the next exercise: `git checkout tests/seeded`. The healer edits them, and Hook 1 needs them failing. `npm run test:seeded` should show 5 failures again.

**Done when**
- The planner's plan cites US-103 acceptance criteria and notes where the app disagrees with the story (the Desk Lamp limit).
- Generated tests use `tests/fixtures.ts`, have the story id in the title, and pass `npm run lint:specs`.
- The healer run against `seeded` leaves the expected values unchanged and reports the planted bugs instead of making the tests pass.
- Hook H1 (blocking edits to `app/`) is your safety net if the healer ignores its guardrails.

**Watch out**: the healer is built to make tests pass. Without guardrails, a green run can mean it rewrote the test to match a bug.

## Check yourself
| Symptom | Likely cause |
|---|---|
| Agent not in the picker | Wrong folder or `user-invocable: false` |
| Agent edits when it should not | Tool list too broad |
| Reviewer misses the obvious | Body does not point to `docs/team-conventions.md` |
| Planner or generator cannot open a browser | `playwright-test` MCP server not running: check **MCP: List Servers** and `.vscode/mcp.json`; run `npx playwright install chromium` |
| Generated test ignores the fixtures | The agent was not told to use them; the seed is the example it copies, so keep the seed in our style |
