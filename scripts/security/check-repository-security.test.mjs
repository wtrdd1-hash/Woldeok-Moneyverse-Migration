import test from 'node:test';
import assert from 'node:assert/strict';
import { forbiddenTrackedPath, secretFindings } from './check-repository-security.mjs';

test('rejects tracked runtime secret/data files', () => {
  assert.equal(forbiddenTrackedPath('backend/.env'), true);
  assert.equal(forbiddenTrackedPath('backend/data/export.jsonl'), true);
  assert.equal(forbiddenTrackedPath('packages/database/migrations/001.sql'), false);
  assert.equal(forbiddenTrackedPath('.env.example'), false);
});

test('detects high-confidence credentials but ignores references/placeholders', () => {
  assert.ok(secretFindings('x=ghp_' + 'A'.repeat(36)).length > 0);
  assert.ok(secretFindings('DATABASE_URL=postgres://user:realpassword@example.test/db').length > 0);
  assert.equal(secretFindings('INTERNAL_API_TOKEN=${INTERNAL_API_TOKEN}').length, 0);
  assert.equal(secretFindings('TOKEN=CHANGE_ME').length, 0);
});
