import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SOURCE_EXTENSIONS = /\.(?:ts|tsx|js|mjs)$/;

export function isSourcePath(path) {
  if (!SOURCE_EXTENSIONS.test(path)) return false;
  return !/(^|\/)(?:node_modules|dist|\.next)(\/|$)/.test(path);
}

export function containsForbiddenControlBytes(bytes) {
  for (const byte of bytes) {
    if (byte <= 0x08 || byte === 0x0b || byte === 0x0c || (byte >= 0x0e && byte <= 0x1f) || byte === 0x7f) {
      return true;
    }
  }
  return false;
}

function run() {
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .filter(isSourcePath);
  const failures = [];
  for (const file of files) {
    if (containsForbiddenControlBytes(readFileSync(file))) failures.push(file);
  }
  if (failures.length) {
    for (const file of failures) console.error(`${file}: raw forbidden control byte in source`);
    process.exitCode = 1;
    return;
  }
  console.log('no raw control bytes in source');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
