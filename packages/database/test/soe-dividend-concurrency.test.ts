import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Existing required CI runtime-check runs pnpm test only AFTER applying all
// migrations to its disposable postgres:17.11-alpine service. This test is
// intentionally skipped without both CI DB URLs; it never probes a host DB.
const ciDatabaseReady = process.env.GITHUB_ACTIONS === 'true' &&
  !!process.env.DATABASE_URL && !!process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!ciDatabaseReady)('isolated CI PostgreSQL SOE dividend concurrency', () => {
  it('serializes same/different keys and rolls back injected mid-write failure', () => {
    const script = resolve(__dirname, '../../../scripts/release/soe-dividend-concurrency.mjs');
    const result = spawnSync(process.execPath, [script], {
      env: { ...process.env, MONEYVERSE_CI_DISPOSABLE_DB: '1' },
      encoding: 'utf8',
      timeout: 90_000,
      maxBuffer: 1024 * 1024,
    });
    expect(result.error?.message).toBeUndefined();
    expect(result.status, `isolated SOE probe failed: ${result.stderr}\n${result.stdout}`).toBe(0);
    expect(result.stdout).toContain('"sameKeyParallel":2');
    expect(result.stdout).toContain('"injectedRollback":true');
  }, 95_000);
});
