const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath } = require('node:url');

function parse(event) {
  let args = event.toolArgs ?? event.tool_input ?? {};
  if (typeof args === 'string') args = JSON.parse(args);
  return {
    name: String(event.toolName ?? event.tool_name ?? ''),
    args,
    root: path.resolve(event.cwd || process.cwd()),
  };
}

function paths(value, result = []) {
  if (Array.isArray(value)) value.forEach((entry) => paths(entry, result));
  else if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (/^(path|filePath|file_path|file|uri|oldPath|newPath|old_path|new_path)$/i.test(key)
          && typeof entry === 'string') result.push(entry);
      else paths(entry, result);
    }
  } else if (typeof value === 'string') {
    for (const match of value.matchAll(/^\*\*\* (?:Add|Update|Delete|Move to)(?: File)?:\s*([^\r\n]+)/gm)) {
      result.push(match[1].trim());
    }
    for (const match of value.matchAll(/^(?:---|\+\+\+) (?:[ab]\/)?([^\t\r\n]+)/gm)) {
      if (match[1] !== '/dev/null') result.push(match[1]);
    }
  }
  return result;
}

function resolve(root, target) {
  const absolute = target.startsWith('file:') ? fileURLToPath(target) : path.resolve(root, target);
  let ancestor = absolute;
  const missing = [];
  while (!fs.existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    missing.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  return path.join(fs.realpathSync(ancestor), ...missing);
}

const isEdit = (name) => /edit|create|write|replace|patch|insert|delete|rename|move/i.test(name);
module.exports = { parse, paths, resolve, isEdit };