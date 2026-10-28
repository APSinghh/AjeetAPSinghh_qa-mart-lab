const fs = require('node:fs');
const path = require('node:path');

const pluginRoot = path.resolve(__dirname, '..');

function install(workspace, { demo = false } = {}) {
  const root = fs.realpathSync(workspace);
  const files = [{
    target: path.join(root, 'apstest-qamart.code-workspace'),
    content: Buffer.from(JSON.stringify({
      folders: [{ path: '.' }],
      settings: {
        'chat.plugins.enabled': true,
        'chat.pluginLocations': { [pluginRoot]: true },
      },
    }, null, 2) + '\n'),
  }];
  for (const kind of ['instructions', 'prompts']) {
    for (const name of fs.readdirSync(path.join(pluginRoot, 'workspace', kind))) {
      files.push({
        target: path.join(root, '.github', kind, name),
        content: fs.readFileSync(path.join(pluginRoot, 'workspace', kind, name)),
      });
    }
  }
  if (demo) {
    files.push({
      target: path.join(root, 'tests/lab/apstest-protected-flows.spec.ts'),
      content: fs.readFileSync(path.join(pluginRoot, 'demo/apstest-protected-flows.spec.ts.template')),
    });
  }
  for (const { target, content } of files) {
    let ancestor = target;
    while (ancestor !== root) {
      if (fs.lstatSync(ancestor, { throwIfNoEntry: false })?.isSymbolicLink()) {
        throw new Error(`Refusing symlink: ${ancestor}`);
      }
      ancestor = path.dirname(ancestor);
    }
    if (fs.existsSync(target) && !fs.readFileSync(target).equals(content)) {
      throw new Error(`Refusing to overwrite ${target}`);
    }
  }
  for (const { target, content } of files) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (!fs.existsSync(target)) fs.writeFileSync(target, content, { flag: 'wx' });
  }
  return files.map(({ target }) => path.relative(root, target));
}

if (require.main === module) {
  try {
    console.log(install(path.resolve(process.argv[2] || '.'), { demo: process.argv.includes('--demo') }).join('\n'));
    console.log('Open apstest-qamart.code-workspace in VS Code to activate the plugin.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { install };