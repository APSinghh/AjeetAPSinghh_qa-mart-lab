# 6. Plugins and MCP

A plugin packages customizations so a team installs them together. It can carry skills, custom agents, hooks and MCP servers. Instructions and prompt files are not plugin components.

## Plugin layout (Agent Plugins 1.0)
```
my-plugin/
  plugin.json                       # name, version, description, $schema
  skills/<name>/SKILL.md            # portable
  mcp.json                          # portable: { "mcpServers": { ... } }
  com.github.copilot/
    agents/<name>.agent.md          # Copilot-specific
    hooks/hooks.json                # Copilot-specific
  scripts/                          # hook and helper scripts
```
Use `${PLUGIN_ROOT}` in hook commands and MCP args to point at files inside the plugin. Do not write logs into the plugin folder.

## Register a plugin you are building
In your user settings:
```json
{
  "chat.plugins.enabled": true,
  "chat.pluginLocations": { "/absolute/path/to/my-plugin": true }
}
```
Then check Extensions > `@agentPlugins` (Installed), Chat > Open Customizations, and **MCP: List Servers**. Both settings are experimental.

## Story PL1: Package your review kit
As a QA lead, I want my skill, agent and hook in one installable plugin so that other teams get the same review workflow.

**Build.** Create a folder outside `.github/` (for example `my-review-kit/`) with:
- your `playwright-failure-analysis` skill from S2
- your `test-reviewer` agent from A2
- your lint-feedback hook from H2, with the script path as `${PLUGIN_ROOT}/scripts/...`
- `plugin.json` with a lowercase kebab-case `name`, a version and a description

**Done when**
- The plugin appears in the Installed list and the three pieces show up in Customizations.
- Disabling the plugin removes all three. Enabling it brings them back.
- You removed any duplicate copies from `.github/` first (hooks from several sources all run).

## Story PL2: Add an MCP server (trainer demo, then you)
As a tester, I want Copilot to call QA Mart and read test results as tools, so that it works with live data instead of guessing.

**Ingredients**: `docs/api/openapi.yaml`, the planted bugs, `reports/results.json`. The trainer's finished example is in `solutions/plugin/qamart-qa-toolkit/`; read its `mcp/qamart-server.cjs` after you try.

**Build.** Add `mcp.json` and a server to your plugin. A stdio MCP server reads JSON-RPC lines on stdin and answers on stdout. Start with two tools:
- `list_failures`: read `reports/results.json` and return failing tests with file, line and first error line
- `validate_coupon`: call `POST /api/coupons/validate` on the running app

**Done when**
- **MCP: List Servers** shows the server running and **Configure Tools** lists its tools.
- "Use the QA Mart MCP tools to check FLAT100 at 500 rupees" produces a tool call you can expand, and the answer matches the tool output.
- The server never prints anything except protocol messages on stdout (logs go to stderr).

**Safety**: plugin MCP servers run code on your machine and start without a trust prompt. Read a plugin before enabling it.

## Check yourself
| Symptom | Likely cause |
|---|---|
| Plugin not listed | `chat.plugins.enabled` off, path wrong, or `name` not kebab-case |
| Skill missing | Folder name differs from `name` in `SKILL.md` |
| Server fails to start | Path in `mcp.json` not using `${PLUGIN_ROOT}`; Node missing |
| Tools missing | Server did not answer `tools/list` or wrote logs on stdout |
