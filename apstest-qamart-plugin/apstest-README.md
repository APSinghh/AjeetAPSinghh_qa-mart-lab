# apstest QA Mart Testing Plugin

Protects **coupons (US-101), stock limits (US-103), and secure ordering (US-105)**.
Stories define correctness, including when a planted application bug makes a test fail.

## Components

| Type | Included |
| --- | --- |
| Instructions (2) | `workspace/instructions/apstest-specs.instructions.md`, `apstest-pages.instructions.md` |
| Prompts (2) | `workspace/prompts/apstest-test-from-story.prompt.md`, `apstest-triage-failure.prompt.md` |
| Skills (2) | `skills/apstest-boundary-testing/`, `skills/apstest-failure-triage/` |
| Agents (2) | `com.github.copilot/agents/apstest-test-author.agent.md`, `apstest-test-reviewer.agent.md` |
| MCP (1) | Pinned Microsoft Playwright MCP `0.0.83`, isolated headless Chromium |
| Hooks (2) | Pre-tool guard and post-edit lint feedback in `com.github.copilot/hooks/hooks.json` |

The package uses Agent Plugins 1.0. Instructions and VS Code prompt files are
**workspace supplements**, not portable plugin components. The installer copies
them to `.github/instructions/` and `.github/prompts/`. Agents, skills, hooks and
MCP remain in the native plugin. Do not copy hooks or agents into `.github/` too.
Required discovery names `plugin.json`, `mcp.json`, `hooks.json` and `SKILL.md`
retain their standard names; other authored filenames use the `apstest` prefix.

## Install

Requires Node.js 20+, npm/network access, a trusted QA Mart checkout, and a
current VS Code with GitHub Copilot and experimental agent plugins enabled.
Review executable scripts and MCP configuration before enabling any plugin.

From **the plugin directory**, with the lab cloned separately:

```bash
node scripts/apstest-install.cjs /absolute/path/to/qa-mart-lab --demo
code /absolute/path/to/qa-mart-lab/apstest-qamart.code-workspace
```

From **the lab root** for this bundled copy:

```bash
node apstest-qamart-plugin/scripts/apstest-install.cjs . --demo
code apstest-qamart.code-workspace
```

The installer refuses conflicting files and symlink destinations. Repeating an
unchanged installation is safe. It generates a workspace with
`chat.plugins.enabled: true` and `chat.pluginLocations` pointing at the plugin;
it never changes global settings. Open that workspace, not its parent directory.
Keep the plugin directory in place; rerun installation on each new machine.
Omit `--demo` to install only customizations. Review/remove a conflicting file
yourself before retrying; there is deliberately no force-overwrite option.

Prepare both browser versions from the **QA Mart root**:

```bash
npm ci
npx playwright install chromium
npx -y @playwright/mcp@0.0.83 install-browser chromium
```

The runner and pinned MCP can require different Chromium revisions. Installing
one does not necessarily install the other. If Linux reports missing system
libraries, ask your administrator to install Playwright's browser dependencies.

## Verify and Demo

From the lab root (substitute the plugin path if installed elsewhere):

```bash
node --test apstest-qamart-plugin/scripts/apstest-plugin.test.cjs
node apstest-qamart-plugin/scripts/apstest-mcp-smoke.cjs .
PORT=3217 npx playwright test tests/lab/apstest-protected-flows.spec.ts --project=chromium --project=ui-v2
npm run typecheck
npm run lint:specs
PORT=3218 npm test
```

The MCP smoke check uses the exact packaged server definition, starts a private
QA Mart instance on a spare port, initializes MCP, lists tools, navigates to
`/login`, checks the real accessibility snapshot, and closes browser and server.
The demo covers SAVE10 arithmetic, sold-out UI controls, and an authenticated
order's response/totals. It does not claim complete boundary or security coverage.

Interactive assessment checklist, to perform in the opened workspace:

1. Extensions: search `@agentPlugins`; confirm `apstest-qamart-plugin` is enabled.
2. Chat: Open Customizations; confirm two agents, two skills, two prompts and
   two file-scoped instructions. Instructions attach to matching files.
3. Run **MCP: List Servers**, start `apstest-playwright`, and check Configure Tools.
4. Start QA Mart with `npm start`; ask `apstest-test-author` to inspect the local
   login page with Playwright MCP, then use `/apstest-test-from-story` for US-103 AC1.
5. Request an edit to `app/server.js`; inspect the guard's denial without making
   the edit. A changed test should produce the post-edit lint feedback.
6. Select `apstest-test-reviewer` and `/apstest-triage-failure` with a real report.
   It has no editing, browser, shell, or delegation tools.
7. Disable the plugin: native agents/skills/hooks/MCP should disappear. Workspace
   instructions/prompts remain until their four installed files are removed.

Results and the project analysis are in `apstest-demo-evidence.md`.
CLI checks prove package behavior, not UI discovery or an agent's future choices.

## Safety and Limits

- The pre-tool hook denies edits to `app/`, stories, `.env*`, guardrails, plugin
  source and paths outside the workspace; it resolves symlinks and patch headers.
- Shell and raw browser-code tools require human approval. Never approve a
  command that modifies protected files, disables hooks or exposes secrets.
- Navigation is restricted by the guard to local HTTP URLs. MCP's origin filter
  is an additional convenience, **not a security boundary** and not redirect protection.
- Post-edit lint runs only for touched TypeScript files in `tests/` or `pages/`,
  with a bounded timeout and argument-array execution. It does not rewrite files
  or certify tests passed. Review the lab linter before enabling the hook.
- Hooks are guardrails, not a sandbox: disabled hooks, unknown wrappers, approved
  shell code, redirects and runtime hook timeouts can bypass these checks.
  Copilot command-hook timeouts are fail-open; malformed input is explicitly denied.
- Never store secrets, real account data, bearer tokens or browser storage state
  in the package. Test accounts come from existing lab data/environment variables.
- Do not reset a shared server, weaken tests, edit app code or hide planted defects.
- Only one MCP server is bundled; the requirement asks for at least one per type.

## Publish

Publish **this directory as the root of your own GitHub repository**, rather than
pointing an install command at the lab repository's root. Keep this README and
the evidence document in that repository. Do not publish reports or auth state.

After publishing, a supported Copilot chat can install the native package with:

```text
/plugin install https://github.com/YOUR_ACCOUNT/YOUR_PLUGIN_REPOSITORY
```

Replace the placeholders with your actual repository, then run the workspace
supplement installer from a local checkout. The local install commands above
are immediately usable; a GitHub URL is not claimed until you publish it.
Pin a reviewed commit for classroom reproducibility and share that real link.
No repository was created, committed or pushed by this setup.

Format references: https://code.visualstudio.com/docs/agents/reference/agent-plugin-reference
and https://docs.github.com/en/copilot/reference/hooks-reference.