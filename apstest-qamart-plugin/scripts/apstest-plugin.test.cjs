const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { install } = require('./apstest-install.cjs');
const { guard } = require('./apstest-guard.cjs');
const { postEdit } = require('./apstest-post-edit.cjs');
const root = path.resolve(__dirname, '../..');

test('clean installation is repeatable and refuses conflicts before writing', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'apstest install '));
  try {
    const installed = install(root);
    assert.equal(installed.length, 5);
    const workspace = JSON.parse(fs.readFileSync(path.join(root, 'apstest-qamart.code-workspace'), 'utf8'));
    assert.equal(workspace.settings['chat.plugins.enabled'], true);
    assert.equal(workspace.settings['chat.pluginLocations'][path.resolve(__dirname, '..')], true);
    assert.ok(installed.includes('.github/instructions/apstest-specs.instructions.md'));
    assert.ok(installed.includes('.github/prompts/apstest-test-from-story.prompt.md'));
    assert.deepEqual(install(root), installed);
    const target = path.join(root, installed[0]);
    fs.writeFileSync(target, 'user content');
    assert.throws(() => install(root), /Refusing to overwrite/);
    assert.equal(fs.readFileSync(target, 'utf8'), 'user content');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('a relocated plugin installs all components and the optional demo in a clean workspace', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'apstest clean '));
  try {
    const source = path.join(temporary, 'apstest-qamart-plugin');
    const workspace = path.join(temporary, 'workspace');
    fs.cpSync(path.resolve(__dirname, '..'), source, { recursive: true });
    fs.mkdirSync(workspace);
    const relocated = require(path.join(source, 'scripts/apstest-install.cjs'));
    assert.equal(relocated.install(workspace, { demo: true }).length, 6);
    const settings = JSON.parse(fs.readFileSync(path.join(workspace, 'apstest-qamart.code-workspace'), 'utf8')).settings;
    assert.equal(settings['chat.pluginLocations'][source], true);
    assert.equal(fs.readdirSync(path.join(workspace, '.github/instructions')).length, 2);
    assert.equal(fs.readdirSync(path.join(workspace, '.github/prompts')).length, 2);
    assert.equal(fs.readdirSync(path.join(source, 'skills')).length, 2);
    assert.equal(fs.readdirSync(path.join(source, 'com.github.copilot/agents')).length, 2);
    assert.ok(fs.existsSync(path.join(workspace, 'tests/lab/apstest-protected-flows.spec.ts')));
    const hooks = JSON.parse(fs.readFileSync(path.join(source, 'com.github.copilot/hooks/hooks.json'), 'utf8'));
    assert.equal(hooks.version, 1);
    assert.equal(Object.keys(hooks.hooks).length, 2);
    for (const entries of Object.values(hooks.hooks)) {
      assert.equal(entries.length, 1);
      const script = entries[0].command.match(/\$\{PLUGIN_ROOT\}\/([^"\n]+)/)[1];
      assert.ok(fs.existsSync(path.join(source, script)));
    }
    const mcp = JSON.parse(fs.readFileSync(path.join(source, 'mcp.json'), 'utf8'));
    assert.equal(mcp.mcpServers['apstest-playwright'].args[1], '@playwright/mcp@0.0.83');
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('guard blocks protected paths in both payload formats and patch headers', () => {
  for (const target of ['app/server.js', 'docs/stories/US-101-coupon-story.md', '.env', '../outside.ts', '.github/hooks/guard.json', 'apstest-qamart-plugin/plugin.json']) {
    assert.equal(guard({ cwd: root, toolName: 'edit', toolArgs: { path: target } }).permissionDecision, 'deny');
    assert.equal(guard({ cwd: root, tool_name: 'apply_patch', tool_input: { input: `*** Update File: ${target}\n` } }).permissionDecision, 'deny');
  }
  assert.deepEqual(guard({ cwd: root, toolName: 'edit', toolArgs: JSON.stringify({ filePath: 'tests/lab/apstest-demo.spec.ts' }) }), {});
  assert.deepEqual(guard({ cwd: root, toolName: 'view', toolArgs: { path: 'app/server.js' } }), {});
  assert.equal(guard({ cwd: root, toolName: 'bash', toolArgs: { command: 'npm test' } }).permissionDecision, 'ask');
  assert.equal(guard({ cwd: root, toolName: 'browser_navigate', toolArgs: { url: 'https://example.com' } }).permissionDecision, 'deny');
  assert.deepEqual(guard({ cwd: root, toolName: 'browser_navigate', toolArgs: { url: 'http://localhost:3000/login' } }), {});
});

test('guard resolves symlinks before deciding edit permissions', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'apstest guard '));
  try {
    fs.mkdirSync(path.join(temporary, 'app'));
    fs.symlinkSync(path.join(temporary, 'app'), path.join(temporary, 'alias'));
    assert.equal(guard({ cwd: temporary, toolName: 'edit', toolArgs: { path: 'alias/server.js' } }).permissionDecision, 'deny');
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('installer rejects dangling symlink destinations without writing files', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'apstest symlink '));
  try {
    fs.symlinkSync(path.join(temporary, 'missing'), path.join(temporary, '.github'));
    assert.throws(() => install(temporary), /Refusing symlink/);
    assert.equal(fs.existsSync(path.join(temporary, 'apstest-qamart.code-workspace')), false);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('guard executable emits a fail-closed JSON decision for malformed input', () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'apstest-guard.cjs')], {
    input: '{broken', encoding: 'utf8', timeout: 5000,
  });
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).permissionDecision, 'deny');
});

test('post-edit hook ignores reads and reports lint failures without altering files', () => {
  assert.deepEqual(postEdit({ cwd: root, toolName: 'view', toolArgs: {} }), {});
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'apstest lint '));
  try {
    fs.mkdirSync(path.join(temporary, 'scripts'));
    fs.mkdirSync(path.join(temporary, 'tests'));
    fs.copyFileSync(path.join(root, 'scripts/lint-specs.cjs'), path.join(temporary, 'scripts/lint-specs.cjs'));
    const target = path.join(temporary, 'tests/apstest-invalid.spec.ts');
    const content = 'await page.waitForTimeout(100);\nexpect(true).toBe(true);\n';
    fs.writeFileSync(target, content);
    const result = postEdit({ cwd: temporary, tool_name: 'Write', tool_input: { file_path: target } });
    assert.match(result.additionalContext, /FAIL/);
    assert.match(result.additionalContext, /no-hard-wait/);
    assert.equal(fs.readFileSync(target, 'utf8'), content);
    fs.writeFileSync(target, 'expect(true).toBe(true);\n');
    assert.match(postEdit({ cwd: temporary, toolName: 'edit', toolArgs: { path: target } }).additionalContext, /PASS/);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});