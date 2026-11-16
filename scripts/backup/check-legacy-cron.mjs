#!/usr/bin/env node
// Read-only deployment-health check: never invokes or edits any backup job.
import { spawnSync } from 'node:child_process';

const LEGACY = '/srv/moneyverse-data/releases/production-current/scripts/backup/backup-r2-free.sh';
function read(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 5000 });
  if (result.error) throw new Error(`${command} failed: ${result.error.code ?? 'unknown'}`);
  return result;
}

export function check(readCommand = read) {
  const cron = readCommand('crontab', ['-l']);
  let entries = '';
  if (cron.status === 0) entries = cron.stdout;
  else if (cron.status === 1 && /no crontab for/.test(cron.stderr)) entries = '';
  else throw new Error('Unable to read user crontab; no configuration assumptions allowed');

  if (entries.split(/\r?\n/).some((line) => !line.trim().startsWith('#') && line.includes(LEGACY))) {
    throw new Error('Retired 04:00 backup invocation still present; never chmod or execute it');
  }
  const required = [
    [['is-active', 'moneyverse-backup.timer'], 'active'],
    [['is-enabled', 'moneyverse-backup.timer'], 'enabled'],
    [['show', 'moneyverse-backup.service', '--property=Result', '--value'], 'success'],
  ];
  for (const [args, expected] of required) {
    const response = readCommand('systemctl', args);
    if (response.status !== 0 || response.stdout.trim() !== expected) {
      throw new Error(`Encrypted backup health check failed (${args[0]}): expected ${expected}`);
    }
  }
  return 'PASS: no active retired cron invocation; encrypted backup timer enabled/active; previous service result success';
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try { console.log(check()); } catch (err) { console.error('FAIL:', err.message); process.exitCode = 1; }
}
