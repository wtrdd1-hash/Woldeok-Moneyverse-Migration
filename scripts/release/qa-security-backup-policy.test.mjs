// CI's policy job executes scripts/release/*.test.mjs. Keep the complete
// source-truth, backup and security policy suites inside that existing gate.
// Import the test modules rather than invoking a subprocess so node:test
// preserves individual failures and the job exits non-zero on regressions.
import { readdir } from 'node:fs/promises';

for (const directory of ['../security', '../backup', '../qa']) {
  const entries = (await readdir(new URL(`${directory}/`, import.meta.url)))
    .filter((name) => name.endsWith('.test.mjs'))
    .sort();
  for (const entry of entries) {
    await import(new URL(`${directory}/${entry}`, import.meta.url));
  }
}
