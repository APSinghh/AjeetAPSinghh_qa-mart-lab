// postToolUse hook: after a spec or Page Object is edited, run the convention lint and typecheck and
// hand any problems back to the agent as additionalContext. Prints {} when everything is clean.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const event = JSON.parse(fs.readFileSync(0, 'utf8'));
let args = event.toolArgs ?? event.tool_input ?? {};
if (typeof args === 'string') { try { args = JSON.parse(args); } catch { args = {}; } }

const root = path.resolve(event.cwd || process.cwd());
const target = [args.path, args.filePath, args.file_path, args.file].find((v) => typeof v === 'string');
const rel = target ? path.relative(root, path.resolve(root, target)).split(path.sep).join('/') : '';
const relevant = /\.spec\.ts$/.test(rel) || /^pages\/.+\.ts$/.test(rel);

if (!relevant || !fs.existsSync(path.join(root, 'scripts', 'lint-specs.cjs'))) {
  process.stdout.write('{}');
  process.exit(0);
}

const run = (cmd, cmdArgs) => spawnSync(cmd, cmdArgs, { cwd: root, encoding: 'utf8', timeout: 60000 });
const lint = run('node', ['scripts/lint-specs.cjs', rel]);
const types = run('npm', ['run', '-s', 'typecheck']);

const problems = [];
if (lint.status !== 0) problems.push(`lint:specs failed for ${rel}:\n${lint.stdout.trim()}`);
if (types.status !== 0) problems.push(`typecheck failed:\n${(types.stdout + types.stderr).trim()}`);

process.stdout.write(JSON.stringify(problems.length
  ? { additionalContext: problems.join('\n\n').slice(0, 4000) + '\n\nFix these before continuing.' }
  : {}));
