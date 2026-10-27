// Zero-dependency convention check for Playwright specs and Page Objects.
// Usage: node scripts/lint-specs.cjs [paths...]   (default: tests and pages, minus tests/legacy)
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const RULES = [
  { id: 'no-hard-wait', re: /waitForTimeout\(/, msg: 'Use a web-first assertion instead of waitForTimeout.' },
  { id: 'no-xpath', re: /['"`]\s*(?:xpath=)?\/\/|xpath=/, msg: 'Use getByRole/getByLabel/getByTestId instead of XPath.' },
  { id: 'no-positional-selector', re: /nth-child|\.nth\(/, msg: 'Do not select by position; products reorder in v2.' },
  { id: 'no-css-id-class', re: /\b(?:click|fill|locator|textContent)\(\s*['"`][#.][\w-]/, msg: 'Use role/label/test-id locators, not CSS ids or classes.' },
  { id: 'no-hardcoded-password', re: /Test@1234/, msg: 'Take credentials from tests/test-data.ts.', skip: /test-data\.ts$/ },
  { id: 'no-hardcoded-url', re: /https?:\/\/localhost:\d+/, msg: 'Use baseURL with a relative path.' },
  { id: 'no-read-then-assert', re: /\.(?:textContent|innerText|inputValue)\(/, msg: 'Assert with toHaveText/toHaveValue so the check retries.' },
];

function walk(target, out) {
  const stat = fs.statSync(target);
  if (stat.isFile()) { if (target.endsWith('.ts')) out.push(target); return out; }
  for (const name of fs.readdirSync(target)) {
    const full = path.join(target, name);
    if (!explicit && (full.includes(`${path.sep}legacy`) || name === 'trace-demo.spec.ts')) continue;
    walk(full, out);
  }
  return out;
}

const args = process.argv.slice(2);
const explicit = args.length > 0;
const resolved = (explicit ? args : ['tests', 'pages']).map((p) => path.resolve(root, p));
const missing = explicit ? resolved.filter((p) => !fs.existsSync(p)) : [];
if (missing.length) { console.error(`No such file or folder: ${missing.map((p) => path.relative(root, p)).join(', ')}`); process.exit(2); }
const targets = resolved.filter((p) => fs.existsSync(p));
const files = targets.flatMap((t) => walk(t, []));

let findings = 0;
for (const file of files) {
  const rel = path.relative(root, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      if (rule.skip && rule.skip.test(rel)) continue;
      if (rule.re.test(line)) { console.log(`${rel}:${i + 1}  ${rule.id}  ${rule.msg}`); findings++; }
    }
  });
  const isSpec = rel.endsWith('.spec.ts');
  if (isSpec && !lines.some((l) => l.includes('expect('))) {
    console.log(`${rel}:1  has-assertion  A spec needs at least one expect().`); findings++;
  }
}

console.log(findings ? `\n${findings} finding(s) in ${files.length} file(s).` : `Checked ${files.length} file(s): no findings.`);
process.exit(findings ? 1 : 0);
