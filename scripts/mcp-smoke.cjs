// Starts QA Mart on a spare port, drives the MCP server over stdio, checks the tools. Run: npm run mcp:smoke
const { spawn } = require('node:child_process');
const path = require('node:path');
const readline = require('node:readline');

const root = path.resolve(__dirname, '..');
const serverPath = path.resolve(root, process.argv[2] || 'solutions/plugin/qamart-qa-toolkit/mcp/qamart-server.cjs');
const PORT = process.env.SMOKE_PORT || '3199';
const EXPECTED = ['qamart_health', 'qamart_list_products', 'qamart_validate_coupon', 'qamart_place_order', 'qamart_list_orders', 'qamart_reset', 'tests_last_run_summary', 'tests_list_failures', 'tests_find_flaky'];

const app = spawn('node', ['app/server.js'], { cwd: root, env: { ...process.env, PORT }, stdio: 'ignore' });
const mcp = spawn('node', [serverPath], {
  cwd: root,
  env: { ...process.env, QAMART_URL: `http://127.0.0.1:${PORT}`, QAMART_REPORT: path.join(root, 'exercises/fixtures/sample-results.json') },
  stdio: ['pipe', 'pipe', 'inherit'],
});

const pending = new Map();
readline.createInterface({ input: mcp.stdout }).on('line', (line) => {
  const msg = JSON.parse(line);
  if (pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});

let nextId = 1;
const request = (method, params) => new Promise((resolve) => {
  const id = nextId++;
  pending.set(id, resolve);
  mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
});
const call = async (name, args = {}) => {
  const res = await request('tools/call', { name, arguments: args });
  return res.result ? JSON.parse(res.result.content[0].text) : res.error;
};
const waitForApp = async () => {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}/api/health`)).ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('QA Mart did not start');
};

let failed = 0;
const check = (label, ok, detail) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `  ${JSON.stringify(detail)}`}`); if (!ok) failed++; };

(async () => {
  await waitForApp();
  const init = await request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'smoke', version: '1' } });
  check('initialize', init.result && init.result.serverInfo.name === 'qamart-qa-toolkit', init);
  mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

  const list = await request('tools/list', {});
  const names = list.result.tools.map((t) => t.name);
  check('tools/list has every tool', EXPECTED.every((n) => names.includes(n)), names);

  check('qamart_health', (await call('qamart_health')).status === 'ok');
  const flat = await call('qamart_validate_coupon', { code: 'FLAT100', subtotal: 500 });
  check('FLAT100 at 500 shows the planted bug (422)', flat.httpStatus === 422, flat);
  await call('qamart_reset');
  const order = await call('qamart_place_order', { email: 'asha@qamart.test', items: [{ id: 'p2', qty: 1 }] });
  check('place order', order.httpStatus === 201 && order.orderId === 'QM-10001', order);
  check('list orders', (await call('qamart_list_orders')).orders.length === 1);
  const failures = await call('tests_list_failures');
  check('tests_list_failures reads the sample report (5)', Array.isArray(failures) && failures.length === 5, failures);
  check('tests_last_run_summary', (await call('tests_last_run_summary')).failed === 5);
  const unknown = await request('tools/call', { name: 'nope', arguments: {} });
  check('unknown tool is a protocol error', unknown.error && unknown.error.code === -32602, unknown);

  console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
})().catch((e) => { console.error(e); failed = 1; }).finally(() => {
  app.kill(); mcp.kill();
  process.exit(failed ? 1 : 0);
});
