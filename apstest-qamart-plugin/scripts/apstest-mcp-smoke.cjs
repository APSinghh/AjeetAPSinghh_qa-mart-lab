const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const readline = require('node:readline');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const os = require('node:os');

const pluginRoot = path.resolve(__dirname, '..');
const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'apstest-mcp-'));
const workspace = path.resolve(process.argv[2] || '.');
const config = JSON.parse(fs.readFileSync(path.join(pluginRoot, 'mcp.json'), 'utf8'));
const server = config.mcpServers['apstest-playwright'];
const pending = new Map();
let nextId = 0;
let app;
let mcp;
let appFailure;

function request(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`MCP ${method} timed out`));
    }, 30000);
    pending.set(id, { resolve, reject, timeout });
    mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
}

async function call(name, args = {}) {
  const response = await request('tools/call', { name, arguments: args });
  if (response.error) throw new Error(JSON.stringify(response.error));
  const result = response.result;
  const text = (result.content || []).filter((entry) => entry.type === 'text').map((entry) => entry.text).join('\n');
  if (result.isError) throw new Error(text);
  return text;
}

async function main() {
  assert.ok(fs.existsSync(path.join(workspace, 'app/server.js')), 'Pass the QA Mart workspace directory');
  const listener = net.createServer();
  await new Promise((resolve, reject) => {
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', resolve);
  });
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const baseURL = `http://127.0.0.1:${port}`;
  app = spawn(process.execPath, ['app/server.js'], {
    cwd: workspace, env: { ...process.env, PORT: String(port) }, stdio: 'ignore',
  });
  app.on('error', (error) => { appFailure = error; });
  app.on('exit', (code) => { appFailure = new Error(`QA Mart exited: ${code}`); });
  const deadline = Date.now() + 15000;
  while (true) {
    if (appFailure) throw appFailure;
    try {
      const response = await fetch(`${baseURL}/api/health`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) break;
    } catch {}
    if (Date.now() >= deadline) throw new Error('QA Mart did not become ready');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  mcp = spawn(process.platform === 'win32' ? 'npx.cmd' : server.command,
    server.args.map((arg) => arg.replaceAll('${PLUGIN_ROOT}', pluginRoot).replaceAll('${PLUGIN_DATA}', outputRoot)),
    { cwd: workspace, stdio: ['pipe', 'pipe', 'inherit'] });
  const rejectPending = (error) => {
    for (const entry of pending.values()) {
      clearTimeout(entry.timeout);
      entry.reject(error);
    }
    pending.clear();
  };
  mcp.on('error', rejectPending);
  mcp.on('exit', (code) => rejectPending(new Error(`MCP exited: ${code}`)));
  mcp.stdin.on('error', rejectPending);
  readline.createInterface({ input: mcp.stdout }).on('line', (line) => {
    let response;
    try { response = JSON.parse(line); } catch {
      rejectPending(new Error('MCP wrote non-protocol output to stdout'));
      return;
    }
    if (response.method === 'roots/list') {
      const { pathToFileURL } = require('node:url');
      mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: response.id, result: {
        roots: [{ uri: pathToFileURL(workspace).href, name: 'QA Mart' }],
      } }) + '\n');
    }
    const entry = pending.get(response.id);
    if (entry) {
      clearTimeout(entry.timeout);
      pending.delete(response.id);
      entry.resolve(response);
    }
  });
  const initialized = await request('initialize', {
    protocolVersion: '2024-11-05', capabilities: { roots: { listChanged: false } },
    clientInfo: { name: 'apstest-capstone-smoke', version: '1.0.0' },
  });
  assert.ok(initialized.result?.serverInfo, JSON.stringify(initialized.error));
  console.log(`PASS MCP initialize: ${initialized.result.serverInfo.name}`);
  mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const list = await request('tools/list');
  const names = list.result.tools.map((tool) => tool.name);
  for (const required of ['browser_navigate', 'browser_snapshot', 'browser_close']) assert.ok(names.includes(required));
  console.log(`PASS tools/list: ${names.length} tools; navigation, snapshots and close available`);
  await call('browser_navigate', { url: `${baseURL}/login` });
  const snapshot = await call('browser_snapshot');
  assert.match(snapshot, /textbox "Email"/);
  assert.match(snapshot, /textbox "Password"/);
  assert.match(snapshot, /button "Sign in"/);
  console.log('PASS real QA Mart login snapshot: Email, Password, Sign in');
  await call('browser_close');
  console.log('PASS isolated browser closed');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => {
  for (const entry of pending.values()) clearTimeout(entry.timeout);
  mcp?.stdin.end();
  mcp?.kill();
  app?.kill();
  fs.rmSync(outputRoot, { recursive: true, force: true });
});