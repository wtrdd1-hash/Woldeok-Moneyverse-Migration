import test from 'node:test';
import assert from 'node:assert/strict';
import { forbiddenTrackedPath, forbiddenChangedPath, secretFindings } from './check-repository-security.mjs';

test('rejects tracked runtime and private operational artifacts', () => {
  for (const path of [
    'backend/.env', 'backend/data/export.jsonl', 'ops/private/backup.json',
    'ops/recovery/live.conf', 'docs/private/operator.md', '.internal/notes.md',
    'backup-2026.tar.zst.enc', 'android/release.jks', 'keys/service.pem',
    '.pgpass', 'logs/key.age', 'mobile/secrets.keystore',
  ]) assert.equal(forbiddenTrackedPath(path), true, path);
  for (const path of [
    'packages/database/migrations/001.sql', '.env.example',
    'docs/worklog/2026-11-18-redacted.md', 'scripts/security/check-repository-security.mjs',
    'ops/systemd/template.service', '.npmrc',
  ]) assert.equal(forbiddenTrackedPath(path), false, path);
});

test('blocks new or modified internal and raw audit records but not redacted public worklog', () => {
  for (const path of [
    'docs/updates/v2026.11.18-internal.md',
    'docs/worklog/2026-11-18-internal.ko.md',
    'docs/changelog/finance-internal.md',
    'docs/worklog/mcp-raw-2026.json', '.npmrc',
  ]) assert.equal(forbiddenChangedPath(path), true, path);
  assert.equal(forbiddenChangedPath('docs/worklog/2026-11-18-public-redacted.md'), false);
});

test('detects high-confidence credentials and ignores placeholders', () => {
  assert.ok(secretFindings('x=ghp_' + 'A'.repeat(36)).length > 0);
  assert.ok(secretFindings('DATABASE_URL=postgres://' + 'user:realpassword@example.test/db').length > 0);
  assert.ok(secretFindings('url=https://discord.com/api/webhooks/12345678/' + 'a'.repeat(30)).includes('Discord webhook'));
  assert.ok(secretFindings('bot=' + '123456789:' + 'A'.repeat(35)).includes('Telegram bot credential'));
  assert.equal(secretFindings('INTERNAL_API_TOKEN=' + '$' + '{INTERNAL_API_TOKEN}').length, 0);
  assert.equal(secretFindings('TOKEN=CHANGE_ME').length, 0);
});

test('security baseline accepts only an available nonzero commit and handles missing objects', async () => {
  const { isAvailableCommit } = await import('./check-repository-security.mjs');
  assert.equal(typeof isAvailableCommit, 'function');
  assert.equal(isAvailableCommit('0'.repeat(40)), false);
  assert.equal(isAvailableCommit('not-a-sha'), false);
  assert.equal(isAvailableCommit('f'.repeat(40)), false);
  const { execFileSync } = await import('node:child_process');
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  assert.equal(isAvailableCommit(head), true);
  const tree = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { encoding: 'utf8' }).trim();
  assert.equal(isAvailableCommit(tree), false);
});

test('candidate security policy receives its resolved classification comparison base', async () => {
  const { readFileSync } = await import('node:fs');
  const ci = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const candidate = readFileSync(new URL('../../.github/workflows/test-candidate.yml', import.meta.url), 'utf8');
  assert.match(candidate, /comparison_base_sha: \$\{\{ steps\.base\.outputs\.sha \}\}/);
  assert.match(candidate, /comparison_base_sha: \$\{\{ needs\.release-input\.outputs\.comparison_base_sha \}\}/);
  assert.match(ci, /comparison_base_sha:[\s\S]*type: string/);
  assert.match(ci, /SECURITY_BASE_SHA: \$\{\{ inputs\.comparison_base_sha \|\| github\.event\.pull_request\.base\.sha \|\| github\.event\.before \}\}/);
});
