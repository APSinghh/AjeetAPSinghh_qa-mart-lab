const fs = require('node:fs');
const path = require('node:path');
const { parse, paths, resolve, isEdit } = require('./apstest-hook-input.cjs');

function decision(permissionDecision, permissionDecisionReason) {
  return {
    permissionDecision,
    permissionDecisionReason,
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision, permissionDecisionReason },
  };
}

function guard(event) {
  const { name, args, root } = parse(event);
  if (/terminal|bash|powershell|execute|run_code|evaluate/i.test(name)) {
    return decision('ask', 'Human approval required for shell or raw browser code; do not modify app/ or guardrails.');
  }
  if (/navigat/i.test(name) && args.url) {
    const url = new URL(args.url);
    if (url.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(url.hostname)) {
      return decision('deny', 'Browse only the local QA Mart HTTP instance.');
    }
  }
  if (!isEdit(name)) return {};
  const targets = paths(args);
  if (!targets.length) return decision('ask', 'Edit target could not be determined; review manually.');
  for (const target of targets) {
    const relative = path.relative(fs.realpathSync(root), resolve(root, target)).split(path.sep).join('/');
    if (relative === '..' || relative.startsWith('../') || path.isAbsolute(relative)
        || /^(app|docs\/stories|\.github\/hooks|\.vscode|apstest-qamart-plugin)(\/|$)/i.test(relative)
        || /(^|\/)\.env(?:\.|$)/i.test(relative)) {
      return decision('deny', 'Application, stories, secrets, guardrails and paths outside the workspace are read-only.');
    }
  }
  return {};
}

if (require.main === module) {
  try {
    process.stdout.write(JSON.stringify(guard(JSON.parse(fs.readFileSync(0, 'utf8')))));
  } catch {
    process.stdout.write(JSON.stringify(decision('deny', 'Invalid hook input or unresolved path; review manually.')));
  }
}

module.exports = { guard };