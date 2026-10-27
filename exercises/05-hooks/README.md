# 5. Hooks

A hook is a command that runs at a fixed point in the agent's life. Instructions ask; hooks make it happen.

**Harness**: hooks fire in both **Local** and **Copilot** sessions, but the two read them differently. Check which one you have selected (Session Target) before you debug.

| | Local harness | Copilot harness |
|---|---|---|
| Event input | `tool_name`, `tool_input` (snake_case) | `toolName`, `toolArgs` (camelCase) |
| Tool names | `replace_string_in_file`, `create_file`, `read_file`, ... | `edit`, `create`, `view`, `bash`, ... |
| `matcher` in the file | ignored: the hook fires for every tool | honoured (regex on the tool name) |
| Deny a tool call | `{ "hookSpecificOutput": { "hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "..." } }` | `{ "permissionDecision": "deny", "permissionDecisionReason": "..." }` |
| Add context after a tool | `{ "hookSpecificOutput": { "hookEventName": "PostToolUse", "additionalContext": "..." } }` | `{ "additionalContext": "..." }` |

The files live in `.github/hooks/*.json` for both. A script that must work in either should read both field names, decide for itself which tool calls matter, and print both output shapes. The solution scripts do exactly that. Use **Show Agent Debug Logs** to see the real tool names in your session.

A hook file looks like this:

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      { "type": "command", "matcher": "edit|create", "command": "node .github/hooks/your-script.cjs", "timeoutSec": 10 }
    ]
  }
}
```
The script gets the event as JSON on stdin and prints one JSON object on stdout. Commands run from the repository root.

## Warm-up: see what the agent sends you
Before writing a rule, log one event. Create `.github/hooks/log-tool.cjs` that appends the tool name and the argument keys (not values) to `.github/hooks/tool-use.log`, and wire it to `preToolUse`. Ask Copilot to edit a spec, then read the log. Note the tool names and which argument holds the file path. Add the log file to `.gitignore`.

## Story H1: The agent must not "fix" the app
As a QA lead, I want edits to `app/` to be blocked so that a failing test never gets "fixed" by changing the application.

**Ingredients**: `npm run test:seeded` (planted bugs tempt the agent), the warm-up log.

**Build.** `preToolUse` hook. The script reads stdin, ignores tools that only read, finds every file path in the arguments (they can be nested, for example a list of replacements), and denies when one is under `app/`. Otherwise print `{}`.

**Done when**
- "Make tests/seeded/coupon-boundary.spec.ts pass" ends with Copilot reporting the bug, not editing `app/server.js`.
- Editing `tests/lab/anything.spec.ts` still works, and reading `app/server.js` still works.
- You can explain what happens if your script crashes (in the Copilot harness a `preToolUse` error denies the call) and on timeout (the call goes through).

## Story H2: Feedback after every spec edit
As a tester, I want typecheck and the convention lint to run after Copilot edits a spec, so that the agent sees its mistakes straight away.

**Build.** `postToolUse` hook. The script works out which files the tool edited; if any is a `.spec.ts` or under `pages/`, run `node scripts/lint-specs.cjs <files>` and `npm run -s typecheck`. When either fails, return the output as `additionalContext`. When both pass, print `{}`. Remember Local ignores `matcher`, so the script must skip read-only tools itself.

**Done when**
- Ask Copilot to write a spec using `waitForTimeout`. The lint finding comes back as context and the agent fixes it without you asking.
- A clean spec produces no extra context.
- The hook finishes in a few seconds. A slow hook slows every edit.

## Check yourself
| Symptom | Likely cause |
|---|---|
| Nothing happens | Bad JSON in the hook file, wrong path, or the output shape of the other harness. Run the script by hand with a sample event on stdin |
| Everything is blocked | Local ignores `matcher`, so the script is denying read tools too; or in the Copilot harness the script crashes |
| Rule bypassed | The tool name or path argument is not what you assumed (check the log or debug logs), or the edit arrives in a nested argument |

Hooks are executable code. Review them like code, never log secrets, and do not interpolate tool arguments into a shell command.
