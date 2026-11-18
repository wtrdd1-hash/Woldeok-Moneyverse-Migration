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
    'ops/systemd/template.service',
  ]) assert.equal(forbiddenTrackedPath(path), false, path);
});

test('blocks new or modified internal and raw audit records but not redacted public worklog', () => {
  for (const path of [
    'docs/updates/v2026.11.18-internal.md',
    'docs/worklog/2026-11-18-internal.ko.md',
    'docs/changelog/finance-internal.md',
    'docs/worklog/mcp-raw-2026.json',
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
