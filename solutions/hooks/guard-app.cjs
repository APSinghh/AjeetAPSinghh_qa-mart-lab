// preToolUse hook: deny agent edits under app/. Copy to .github/hooks/ with guard-app.json.
// Works in both harnesses: Copilot sends toolName/toolArgs, Local sends tool_name/tool_input and ignores
// "matcher", so this script decides for itself which tool calls are edits.
// A crash here denies the tool call in the Copilot harness, so keep it simple.
const fs = require('node:fs');
const path = require('node:path');

const event = JSON.parse(fs.readFileSync(0, 'utf8'));
const toolName = String(event.toolName ?? event.tool_name ?? '');
let args = event.toolArgs ?? event.tool_input ?? {};
if (typeof args === 'string') { try { args = JSON.parse(args); } catch { args = {}; } }

const EDIT_TOOL = /edit|create|write|replace|patch|insert/i;
const PATH_KEY = /^(path|filepath|file_path|file|uri)$/i;

// Collect every path-like value, including nested ones such as replacements[].filePath,
// and the file headers inside patch text ("*** Update File: app/server.js").
const PATCH_HEADER = /\*\*\* (?:Add|Update|Delete) File:\s*(\S+)/g;
function paths(value, out = []) {
  if (Array.isArray(value)) value.forEach((v) => paths(v, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (PATH_KEY.test(k) && typeof v === 'string') out.push(v.replace(/^file:\/\//, ''));
      else paths(v, out);
    }
  } else if (typeof value === 'string') {
    for (const m of value.matchAll(PATCH_HEADER)) out.push(m[1]);
  }
  return out;
}

const root = path.resolve(event.cwd || process.cwd());
const appDir = path.join(root, 'app') + path.sep;
const touchesApp = EDIT_TOOL.test(toolName) && paths(args).some((p) => (path.resolve(root, p) + path.sep).startsWith(appDir));

if (touchesApp) {
  const reason = 'app/ is read-only for agents. Keep the failing test and report the application bug instead.';
  process.stdout.write(JSON.stringify({
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
} else {
  process.stdout.write('{}');
}
