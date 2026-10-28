const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parse, paths, resolve, isEdit } = require('./apstest-hook-input.cjs');

function postEdit(event) {
  const { name, args, root } = parse(event);
  if (!isEdit(name)) return {};
  const canonicalRoot = fs.realpathSync(root);
  const touched = [...new Set(paths(args).map((target) => resolve(root, target)))].filter((target) => {
    const relative = path.relative(canonicalRoot, target).split(path.sep).join('/');
    return /^(tests|pages)\/.+\.ts$/.test(relative) && fs.existsSync(target);
  });
  if (!touched.length) return {};
  const linter = path.join(root, 'scripts', 'lint-specs.cjs');
  if (!fs.existsSync(linter)) return { additionalContext: 'QA Mart linter unavailable; validation not run.' };
  const result = spawnSync(process.execPath, [linter, ...touched], {
    cwd: root, encoding: 'utf8', timeout: 8000, maxBuffer: 128 * 1024, shell: false,
  });
  const summary = result.status === 0 ? 'PASS' : 'FAIL';
  const output = result.error ? result.error.message : `${result.stdout || ''}${result.stderr || ''}`;
  const additionalContext = `apstest spec lint ${summary}:\n${output.slice(0, 6000)}\nRun typecheck and the focused Playwright test before handover.`;
  return {
    additionalContext,
    hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext },
  };
}

if (require.main === module) {
  try {
    process.stdout.write(JSON.stringify(postEdit(JSON.parse(fs.readFileSync(0, 'utf8')))));
  } catch {
    process.stdout.write(JSON.stringify({ additionalContext: 'apstest lint hook failed; run validation manually.' }));
  }
}

module.exports = { postEdit };