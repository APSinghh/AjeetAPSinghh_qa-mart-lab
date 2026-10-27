# qamart-qa-toolkit (trainer reference plugin)

Everything the six exercises build, packaged as one plugin plus an MCP server.

| Part | File |
|---|---|
| Plugin manifest | `plugin.json` |
| Skills | `skills/playwright-failure-analysis/`, `skills/coupon-boundary-testing/` |
| Custom agents | `com.github.copilot/agents/test-reviewer.agent.md`, `qamart-explorer.agent.md` |
| Hook | `com.github.copilot/hooks/hooks.json` runs `scripts/post-edit-checks.cjs` |
| MCP server | `mcp.json` starts `mcp/qamart-server.cjs` (stdio, no dependencies) |

## MCP tools
`qamart_health`, `qamart_list_products`, `qamart_validate_coupon`, `qamart_place_order`, `qamart_list_orders`, `qamart_reset`, `tests_last_run_summary`, `tests_list_failures`, `tests_find_flaky`.

Environment: `QAMART_URL` (default `http://127.0.0.1:3000`), `QAMART_REPORT` (default `<workspace>/reports/results.json`), `QA_PASS`.

## Try it
1. In user settings: `"chat.plugins.enabled": true` and `"chat.pluginLocations": { "<absolute path to this folder>": true }`.
2. `npm start` in the repo, then `npm test` so `reports/results.json` exists.
3. Check **MCP: List Servers** (qamart running) and **Configure Tools** (nine tools).
4. Ask: "Use the QA Mart MCP tools to check FLAT100 at 500 rupees, then summarise the last test run."

Test the server without VS Code: `npm run mcp:smoke` from the repo root.
