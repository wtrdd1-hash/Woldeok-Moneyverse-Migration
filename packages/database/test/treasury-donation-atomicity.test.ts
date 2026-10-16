import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Real SQL integration, but only on disposable CI DB after all forward migrations.
// The fixture creates a synthetic account inside BEGIN/ROLLBACK and uses the
// actual app role for transfers/replay/permission denial. Never run on Production.
const migratorUrl = process.env.MIGRATOR_DATABASE_URL;
if (process.env.CI && !migratorUrl) {
  throw new Error('CI treasury donation DB acceptance requires MIGRATOR_DATABASE_URL');
}

describe('ledger-first treasury donation (disposable CI PostgreSQL)', () => {
  it.skipIf(!migratorUrl)('conserves two-sided WLD, rejects replay mutations and raw privileges', () => {
    const url = new URL(migratorUrl!);
    if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
      throw new Error('unsupported migrator database protocol');
    }
    if (process.env.CI && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      throw new Error('CI treasury smoke must run only on the disposable local PostgreSQL service');
    }
    const script = fileURLToPath(new URL('./fixtures/treasury-donation-atomicity-v744.sql', import.meta.url));
    const result = spawnSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-f', script], {
      encoding: 'utf8',
      timeout: 30000,
      env: {
        ...process.env,
        PGHOST: url.hostname,
        PGPORT: url.port || '5432',
        PGUSER: decodeURIComponent(url.username),
        PGPASSWORD: decodeURIComponent(url.password),
        PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
      },
    });
    // Never include the command or URL in failures: they contain DB credentials.
    if (result.error) throw new Error(`synthetic treasury SQL unavailable (${result.error.name})`);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('SYNTHETIC_TREASURY_ATOMICITY_IDEMPOTENCY_ROLE_GUARDS_PASS');
    expect(result.stdout).toContain('ROLLBACK');
  });
});
