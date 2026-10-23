import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const isDisposableCi = process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';

// This is intentionally a release-blocking integration test, not a mock of
// PostgreSQL grants. A green source-only test cannot prove effective privileges.
describe('P0 protected table DML boundary', () => {
  it('CI runs database package security tests after migrations', () => {
    const workflow = readFileSync(resolve(__dirname, '../../../.github/workflows/ci.yml'), 'utf8');
    expect(workflow).toMatch(/name: Apply database migrations[\s\S]*name: Test/);
    expect(workflow).toMatch(/name: Test[\s\S]*run: pnpm test/);
  });

  it.skipIf(!isDisposableCi)('rejects unsafe effective app-role privileges on real disposable PostgreSQL', () => {
    if (!process.env.MIGRATOR_DATABASE_URL) throw new Error('CI must provide disposable MIGRATOR_DATABASE_URL');
    const script = resolve(__dirname, '../../../scripts/security/check-app-role-privileges.mjs');
    const result = spawnSync(process.execPath, [script], { encoding: 'utf8', timeout: 35000 });
    if (result.error) throw new Error(`P0 privilege guard unavailable: ${result.error.name}`);
    expect(result.status, 'P0 direct DML grants must be revoked before release').toBe(0);
    expect(result.stdout).toContain('APP_ROLE_PROTECTED_DML_DENIED_PASS');
  });
});
