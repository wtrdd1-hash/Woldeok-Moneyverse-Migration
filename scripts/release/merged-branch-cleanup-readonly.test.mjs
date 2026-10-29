import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('../../.github/workflows/cleanup-merged-branches.yml', import.meta.url));
const source = readFileSync(file, 'utf8');

test('merged branch inventory has only read-only token permissions', () => {
  const permissions = source.match(/^permissions:\s*\n((?:[ ]{2}[^\n]+\n)+)/m)?.[1];
  assert.ok(permissions, 'explicit top-level permissions required');
  assert.match(permissions, /^  contents: read$/m);
  assert.match(permissions, /^  pull-requests: read$/m);
  assert.doesNotMatch(permissions, /:\s*write\b/);
});

test('merged branch inventory never closes PRs, deletes branches, merges or promotes', () => {
  assert.doesNotMatch(source, /\bgit\s+push\b/);
  assert.doesNotMatch(source, /\bgh\s+pr\s+(?:close|merge)\b/);
  assert.doesNotMatch(source, /\bgh\s+api\s+--method\s+(?:PATCH|POST|PUT|DELETE)\b/);
  assert.doesNotMatch(source, /\bgh\s+workflow\s+run\b/);
  assert.doesNotMatch(source, /\bgh\s+api\s+.*(?:refs\/heads|pulls\/)\S*\s+-X\s+(?:PATCH|DELETE)/);
});

test('merged branch inventory retains scheduled and merged-PR observation', () => {
  assert.match(source, /pull_request:/);
  assert.match(source, /schedule:/);
  assert.match(source, /pulls\?state=closed&base=main&per_page=100/);
  assert.match(source, /git merge-base --is-ancestor/);
});
