#!/usr/bin/env node
// Summarise a Playwright JSON report: one line per failed test, then totals.
// Usage: node summarize-report.cjs [path to results.json]  (default: reports/results.json)
const fs = require('node:fs');

const file = process.argv[2] || 'reports/results.json';
if (!fs.existsSync(file)) {
  console.error(`No report at ${file}. Run "npm test" first.`);
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(file, 'utf8'));
const strip = (s) => String(s || '').replace(/\u001b\[[0-9;]*m/g, '');

function* specs(suite, parentFile) {
  const f = suite.file || parentFile;
  for (const spec of suite.specs || []) yield { spec, file: f };
  for (const child of suite.suites || []) yield* specs(child, f);
}

function reason(result) {
  const message = strip((result.error && result.error.message) || '');
  const lines = message.split('\n').map((l) => l.trim()).filter(Boolean);
  const detail = lines.filter((l) => l.startsWith('Expected') || l.startsWith('Received'));
  return [lines[0], ...detail].filter(Boolean).join(' | ');
}

let failures = 0;
for (const root of report.suites || []) {
  for (const { spec, file } of specs(root, root.file)) {
    for (const test of spec.tests || []) {
      const results = test.results || [];
      const last = results[results.length - 1];
      if (!last || (last.status !== 'failed' && last.status !== 'timedOut')) continue;
      failures += 1;
      console.log(`FAILED  ${file}:${spec.line}  [${test.projectName}]  ${spec.title}`);
      console.log(`        ${reason(last)}`);
    }
  }
}

const s = report.stats || {};
console.log(`\n${failures} failed, ${s.expected ?? '?'} passed, ${s.flaky ?? 0} flaky, ${s.skipped ?? 0} skipped`);
process.exit(failures ? 1 : 0);
