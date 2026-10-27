// Warm-up hook: record which tool the agent called and which argument names it used. Never logs values.
// Wire to preToolUse. Writes next to this script; add tool-use.log to .gitignore.
const fs = require('node:fs');
const path = require('node:path');

const event = JSON.parse(fs.readFileSync(0, 'utf8'));
let args = event.toolArgs ?? event.tool_input;
if (typeof args === 'string') { try { args = JSON.parse(args); } catch { args = {}; } }

const line = JSON.stringify({ tool: event.toolName ?? event.tool_name, argKeys: Object.keys(args || {}) });
fs.appendFileSync(path.join(__dirname, 'tool-use.log'), line + '\n');
process.stdout.write('{}');
