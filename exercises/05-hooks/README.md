# 5. Hooks

A hook is a command that runs at a fixed point in the agent's life. Instructions ask; hooks make it happen.

**Harness**: select **Copilot** in Chat. Hooks live in `.github/hooks/*.json` and use this shape:

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
Before writing a rule, log one event. Create `.github/hooks/log-tool.cjs` that appends `toolName` and the argument keys (not values) to `.github/hooks/tool-use.log`, and wire it to `preToolUse`. Ask Copilot to edit a spec, then read the log. Tool names you will see include `edit`, `create`, `view`, `bash`. Add the log file to `.gitignore`.

## Story H1: The agent must not "fix" the app
As a QA lead, I want edits to `app/` to be blocked so that a failing test never gets "fixed" by changing the application.

**Ingredients**: `npm run test:seeded` (planted bugs tempt the agent), the warm-up log.

**Build.** `preToolUse` hook for `edit|create`. The script reads stdin, finds the target path in `toolArgs`, and prints
```json
{ "permissionDecision": "deny", "permissionDecisionReason": "app/ is read-only for agents. Report the bug instead." }
```
when the path is under `app/`. Otherwise print `{}`.

**Done when**
- "Make tests/seeded/coupon-boundary.spec.ts pass" ends with Copilot reporting the bug, not editing `app/server.js`.
- Editing `tests/lab/anything.spec.ts` still works.
- You can explain what happens if your script crashes (a `preToolUse` command error denies the call) and on timeout (the call goes through).

## Story H2: Feedback after every spec edit
As a tester, I want typecheck and the convention lint to run after Copilot edits a spec, so that the agent sees its mistakes straight away.

**Build.** `postToolUse` hook, `matcher: "edit|create"`. The script reads the edited path; if it is a `.spec.ts` or under `pages/`, run `node scripts/lint-specs.cjs <file>` and `npm run -s typecheck`. When either fails, print `{ "additionalContext": "<the tool output, trimmed>" }`. When both pass, print `{}`.

**Done when**
- Ask Copilot to write a spec using `waitForTimeout`. The lint finding comes back as context and the agent fixes it without you asking.
- A clean spec produces no extra context.
- The hook finishes in a few seconds. A slow hook slows every edit.

## Check yourself
| Symptom | Likely cause |
|---|---|
| Nothing happens | Wrong harness, bad JSON in the hook file, or path not found. Run the script by hand with a sample event on stdin |
| Everything is blocked | Script crashes: any `preToolUse` error denies the call |
| Rule bypassed | Matcher does not match the tool name you saw in the log |

Hooks are executable code. Review them like code, never log secrets, and do not interpolate tool arguments into a shell command.
