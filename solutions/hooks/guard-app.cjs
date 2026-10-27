// preToolUse hook: deny agent edits under app/. Copy to .github/hooks/ with guard-app.json.
// Any crash here denies the tool call (command preToolUse hooks fail closed), so keep it simple.
const fs = require('node:fs');
const path = require('node:path');

const event = JSON.parse(fs.readFileSync(0, 'utf8'));
let args = event.toolArgs ?? event.tool_input ?? {};
if (typeof args === 'string') { try { args = JSON.parse(args); } catch { args = {}; } }

const root = path.resolve(event.cwd || process.cwd());
const appDir = path.join(root, 'app') + path.sep;

// Edit tools name their target in different fields depending on the tool.
const candidates = [args.path, args.filePath, args.file_path, args.file].filter((v) => typeof v === 'string');
const touchesApp = candidates.some((p) => (path.resolve(root, p) + path.sep).startsWith(appDir) || path.resolve(root, p).startsWith(appDir));

if (touchesApp) {
  process.stdout.write(JSON.stringify({
    permissionDecision: 'deny',
    permissionDecisionReason: 'app/ is read-only for agents. Keep the failing test and report the application bug instead.',
  }));
} else {
  process.stdout.write('{}');
}
