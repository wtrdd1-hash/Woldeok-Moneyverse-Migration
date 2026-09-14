import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const files = [
  'docs/mobile-api-contract.json',
  'docs/mobile-api-schema-reference.md',
  'docs/mobile-api-schema-reference.ko.md',
];

// TypeScript exposes internal well-known-symbol properties using generated names
// such as __@toStringTag@716. The numeric suffix is compiler-program-local and
// can change after dependency/type graph updates without changing the public API.
// Normalize only that unstable suffix before comparing generated artifacts with
// the committed baseline. All other contract differences still fail the check.
function canonicalize(value) {
  return value.replace(/(__@[A-Za-z0-9_$]+@)\d+/g, '$1<internal>');
}

let changed = false;
for (const file of files) {
  const generated = canonicalize(fs.readFileSync(file, 'utf8'));
  const committed = canonicalize(
    execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8' }),
  );

  if (generated !== committed) {
    changed = true;
    console.error(`API contract drift detected: ${file}`);
  }
}

if (changed) {
  process.exitCode = 1;
} else {
  console.log('API contract artifacts match after internal TypeScript symbol normalization.');
}
