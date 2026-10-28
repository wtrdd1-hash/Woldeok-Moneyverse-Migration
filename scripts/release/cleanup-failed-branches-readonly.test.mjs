import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const workflow = fileURLToPath(new URL('../../.github/workflows/cleanup-failed-branches.yml', import.meta.url));

test('repeated-failure inventory requests read-only GitHub token permissions', () => {
  const source = readFileSync(workflow, 'utf8');
  const permissions = source.match(/^permissions:\s*\n((?:[ ]{2}[^\n]+\n)+)/m)?.[1];
  assert.ok(permissions, 'top-level permissions must be explicit');
  assert.match(permissions, /^[ ]{2}contents: read$/m);
  assert.match(permissions, /^[ ]{2}pull-requests: read$/m);
  assert.match(permissions, /^[ ]{2}actions: read$/m);
  assert.doesNotMatch(permissions, /:\s*write\b/);
});

test('repeated-failure inventory cannot close PRs, delete refs, merge or dispatch releases', () => {
  const source = readFileSync(workflow, 'utf8');
  assert.doesNotMatch(source, /\bgh\s+pr\s+(?:close|merge)\b/);
  assert.doesNotMatch(source, /\bgh\s+api\s+--method\s+(?:PATCH|POST|PUT|DELETE)\b/);
  assert.doesNotMatch(source, /\bgh\s+workflow\s+run\b/);
  assert.doesNotMatch(source, /\bgit\s+push\b/);
});