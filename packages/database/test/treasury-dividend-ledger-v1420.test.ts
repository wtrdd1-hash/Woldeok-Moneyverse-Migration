import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migratorUrl = process.env.MIGRATOR_DATABASE_URL;
const inDisposableCi = process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';
if (inDisposableCi && !migratorUrl) throw new Error('CI dividend E2E requires disposable MIGRATOR_DATABASE_URL');

describe('v1420 actual PostgreSQL citizen dividend', () => {
  it.skipIf(!inDisposableCi || !migratorUrl)('balances immutable postings, settles vault and replays once', () => {
    const u = new URL(migratorUrl!);
    if (!['127.0.0.1', 'localhost'].includes(u.hostname) || (u.port && u.port !== '5432') ||
       u.username !== 'moneyverse_migrator' || u.pathname !== '/woldeok_moneyverse_dev') {
      throw new Error('isolated disposable Github CI 5432 PostgreSQL only');
    }
    const file = join(__dirname, 'fixtures', 'treasury-dividend-ledger-v1420.sql');
    const result = spawnSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-f', file], {
      encoding: 'utf8', timeout: 35000,
      env: { ...process.env, PGHOST:u.hostname, PGPORT:u.port || '5432', PGUSER:u.username,
        PGPASSWORD:decodeURIComponent(u.password),PGDATABASE:u.pathname.substring(1) },
    });
    if (result.error) throw new Error(`disposable SQL unavailable: ${result.error.name}`);
    if (result.status !== 0) throw new Error(`synthetic dividend SQL test failed (${result.stderr?.slice(-1000)})`);
    expect(result.stdout).toContain('V1420_TREASURY_DIVIDEND_LEDGER_ATOMIC_PASS');
    expect(result.stdout).toContain('ROLLBACK');
  });
});
