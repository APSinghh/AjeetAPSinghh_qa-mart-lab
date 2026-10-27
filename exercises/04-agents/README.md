# 4. Custom agents

A custom agent is a role: its own instructions, its own tool list, optionally a model, and handoffs to other agents. Use one when a task needs a different set of tools or an isolated context.

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

## Check yourself
| Symptom | Likely cause |
|---|---|
| Agent not in the picker | Wrong folder or `user-invocable: false` |
| Agent edits when it should not | Tool list too broad |
| Reviewer misses the obvious | Body does not point to `docs/team-conventions.md` |
