# Trainer run-sheet: 2-hour session, 50 testers

## Before the session
- [ ] `npm install && npx playwright install chromium` on the demo machine
- [ ] `npm test` green, `npm run test:seeded` shows 5 failed, `npm run mcp:smoke` passes
- [ ] Nothing else on port 3000 (`lsof -i :3000`)
- [ ] VS Code user settings: `chat.plugins.enabled: true`
- [ ] Testers' pre-read: `exercises/00-start-here.md`. Ask them to run the setup block and tell you if any command fails
- [ ] Hide `solutions/` from the shared copy of the repo (or delete the folder before you share)

## Timeline
| Time | What | Notes |
|---|---|---|
| 0:00 | Map: instructions, prompts, skills, agents, hooks, MCP, plugins | Use the decision guide at the end of `00-start-here.md` |
| 0:15 | Build Instructions 1 | Demo the before and after with the locked-user prompt |
| 0:30 | Build Prompt 1 (Local harness) | Show `${input:story}` and `argument-hint` |
| 0:45 | Build Skill 1 | Show References proving the skill loaded without being named |
| 1:00 | Build Agent 1 and Hook 1 | Hook 1 payoff: the agent cannot edit `app/` |
| 1:30 | Live demo: build the plugin with an MCP server | Script below |
| 1:50 | Wrap-up | Take-home: second story of each type |

## Live demo script (about 15 minutes)
1. Show `solutions/plugin/qamart-qa-toolkit/` as a tree. Name each part and map it to an exercise.
2. `plugin.json`: name, version, `$schema`. Point out the name rules (lowercase, hyphens).
3. `mcp.json`: stdio command with `${PLUGIN_ROOT}`. Open `mcp/qamart-server.cjs` and show the three methods (`initialize`, `tools/list`, `tools/call`) and that logs go to stderr.
4. Run `npm run mcp:smoke` in a terminal to prove the server without VS Code.
5. Add the folder to `chat.pluginLocations`. Show Installed plugins, Customizations, **MCP: List Servers** and **Configure Tools**.
6. `npm start`, `npm test`. Ask: "Use the QA Mart MCP tools to check FLAT100 at 500 rupees, then summarise the last test run." Expand the tool calls. The 422 at 500 is bug B1.
7. Disable the plugin and show everything disappears. Enable it again.

## Fallback if plugin registration misbehaves
- Same MCP server without a plugin: Command Palette > MCP: Add Server > Command (stdio) > `node solutions/plugin/qamart-qa-toolkit/mcp/qamart-server.cjs`.
- Or demonstrate with `npm run mcp:smoke` and walk through the output.
- Check Show Agent Debug Logs and the plugin troubleshooting list in the VS Code docs.

## Common problems
| Problem | Fix |
|---|---|
| All tests fail on a tester's machine | Another process on port 3000; set `PORT=3100` |
| `/name` prompt missing | Session target is not Local |
| Hook does nothing | JSON invalid, or the output shape belongs to the other harness (Local nests it under `hookSpecificOutput`). Run the script by hand with a sample event on stdin |
| Hooks fire twice | Plugin and `.github/hooks` both define the same hook |
| Skill ignored | `name` differs from the folder, or description lacks the words the user says |

## After the session
Reset the demo: `git checkout app/server.js` if you fixed a bug, delete `.github/` contents you created, delete `reports/`.
