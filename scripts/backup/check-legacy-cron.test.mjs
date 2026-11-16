import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { check } from './check-legacy-cron.mjs';

const retired = '0 4 * * * /srv/moneyverse-data/releases/production-current/scripts/backup/backup-r2-free.sh >> /srv/moneyverse-data/backups/backup.log 2>&1';
function fake(cron = '', opts = {}) {
  const seen = [];
  const fn = (cmd, args) => {
    seen.push({ cmd, args });
    if (cmd === 'crontab') return opts.missingCron
      ? { status: 1, stdout: '', stderr: 'no crontab for debian' }
      : { status: 0, stdout: cron, stderr: '' };
    if (args[0] === 'is-active') return { status: 0, stdout: opts.active ?? 'active' };
    if (args[0] === 'is-enabled') return { status: 0, stdout: opts.enabled ?? 'enabled' };
    return { status: 0, stdout: opts.result ?? 'success' };
  };
  return { fn, seen };
}
test('passes with no user crontab and healthy backup timer', () => {
  const f = fake('', { missingCron: true });
  assert.match(check(f.fn), /^PASS:/);
  assert.ok(f.seen.every((call) => call.cmd === 'crontab' || call.cmd === 'systemctl'));
});
test('passes unrelated cron without changing it', () => {
  const cron = '5 3 * * * echo harmless\n';
  const f = fake(cron);
  assert.match(check(f.fn), /^PASS:/);
  assert.equal(cron, '5 3 * * * echo harmless\n');
});
test('rejects retired cron', () => {
  assert.throws(() => check(fake(`${retired}\n`).fn), /Retired/);
});
test('rejects modified retired cron invocation', () => {
  assert.throws(() => check(fake('1 4 * * * /srv/moneyverse-data/releases/production-current/scripts/backup/backup-r2-free.sh\n').fn), /Retired/);
});
test('rejects disabled encrypted backup timer', () => {
  assert.throws(() => check(fake('', { active: 'inactive' }).fn), /health check failed/);
});
test('rejects previous encrypted backup failure', () => {
  assert.throws(() => check(fake('', { result: 'exit-code' }).fn), /health check failed/);
});
test('rejects unreadable crontab instead of reporting a pass', () => {
  const f = () => ({ status: 2, stdout: '', stderr: 'access denied' });
  assert.throws(() => check(f), /Unable to read/);
});
test('does not run a backup or mutate cron as part of verification', () => {
  const f = fake(''); check(f.fn);
  assert.ok(f.seen.every(({ cmd, args }) => cmd === 'systemctl' || (cmd === 'crontab' && args.length === 1 && args[0] === '-l')));
});
