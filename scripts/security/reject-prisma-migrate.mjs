import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SCANNABLE_EXTENSIONS = /(?:^package\.json$|\.(?:json|ts|tsx|js|mjs|yml|yaml)$)/;

export function isScannablePath(path) {
  if (!SCANNABLE_EXTENSIONS.test(path)) return false;
  return !/(^|\/)(?:node_modules|\.git|docs)(\/|$)/.test(path);
}

export function containsForbiddenPrismaMigration(text) {
  const forbidden = ['prisma', 'migrate'].join(' ');
  return text.includes(forbidden);
}

function run() {
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .filter(isScannablePath);

  const failures = [];
  for (const file of files) {
    if (containsForbiddenPrismaMigration(readFileSync(file, 'utf8'))) failures.push(file);
  }

  if (failures.length) {
    for (const file of failures) console.error(`${file}: forbidden Prisma schema-mutation command`);
    process.exitCode = 1;
    return;
  }
  console.log('no forbidden Prisma schema-mutating command found');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
