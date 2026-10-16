import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migratorUrl = process.env.MIGRATOR_DATABASE_URL;
const githubDisposableDb = process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';
if (githubDisposableDb && !migratorUrl) {
  throw new Error('CI league ledger acceptance requires disposable MIGRATOR_DATABASE_URL');
}

describe('stock-league ledger entry (disposable CI PostgreSQL)', () => {
  it.skipIf(!githubDisposableDb || !migratorUrl)('charges exactly once through scoped app-role double-entry and rolls back fixture', () => {
    const url = new URL(migratorUrl!);
    if (!['postgres:', 'postgresql:'].includes(url.protocol)
      || !['127.0.0.1','localhost'].includes(url.hostname)
      || (url.port !== '' && url.port !== '5432')
      || url.username !== 'moneyverse_migrator'
      || url.pathname !== '/woldeok_moneyverse_dev') {
      throw new Error('CI league ledger test requires exact disposable local DB contract');
    }
    const fixture = join(__dirname,'fixtures','stock-league-ledger-v754.sql');
    const r = spawnSync('psql',['-X','-v','ON_ERROR_STOP=1','-f',fixture],{
      encoding:'utf8',timeout:30000,
      env:{...process.env,PGHOST:url.hostname,PGPORT:url.port || '5432',
        PGUSER:decodeURIComponent(url.username),
        PGPASSWORD:decodeURIComponent(url.password),
        PGDATABASE:decodeURIComponent(url.pathname.slice(1))},
    });
    if(r.error) throw new Error(`isolated league SQL unavailable (${r.error.name})`);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('STOCK_LEAGUE_DOUBLE_ENTRY_APP_ROLE_IDEMPOTENCY_PASS');
    expect(r.stdout).toContain('ROLLBACK');
  });
});
