import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/auto-integrate-promote.yml'), 'utf8');

test('automatic integration has read-only repository permissions', () => {
  const permissions = workflow.match(/^permissions:\s*\n((?: {2}[^\n]+\n)+)/m)?.[1];
  assert.ok(permissions, 'workflow permissions must be explicit');
  assert.match(permissions, /^ {2}contents: read$/m);
  assert.match(permissions, /^ {2}pull-requests: read$/m);
  assert.match(permissions, /^ {2}actions: read$/m);
  assert.doesNotMatch(workflow, /(?:contents|pull-requests|actions|deployments):\s*write\b/);
});

test('candidate success cannot automatically merge, rewrite or delete worker branches', () => {
  assert.doesNotMatch(workflow, /\bgh\s+pr\s+merge\b/);
  assert.doesNotMatch(workflow, /\bgit\s+(?:push|merge|clean|reset|checkout|branch\s+-[dD])\b/);
  assert.doesNotMatch(workflow, /\bgh\s+api\s+(?:--method|-X)\s+(?:POST|PATCH|PUT|DELETE)\b/i);
  assert.doesNotMatch(workflow, /\bgh\s+workflow\s+run\b/);
});

test('scheduled workflow explicitly reports HOLD until independent exact-SHA Test and finance attestation', () => {
  assert.match(workflow, /BLOCKED/);
  assert.match(workflow, /exact-SHA/);
  assert.match(workflow, /authenticated/);
  assert.match(workflow, /migration/);
  assert.match(workflow, /gh api/);
});
