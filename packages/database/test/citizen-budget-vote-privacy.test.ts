import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = 'migrations/280-citizen-budget-vote-private-aggregate.sql';
const sql = () => readFileSync(migration, 'utf8');
const repo = () => readFileSync('../../backend/src/admin/treasury/treasury.repository.ts', 'utf8');
const controller = () => readFileSync('../../backend/src/admin/treasury/treasury.controller.ts', 'utf8');
const migratorUrl = process.env.MIGRATOR_DATABASE_URL;
const isolatedCI = process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';

if (isolatedCI && !migratorUrl) throw new Error('disposable PostgreSQL is required for vote privacy CI');

describe('P0 citizen budget vote privacy', () => {
  it('revokes app and PUBLIC raw vote privileges in a new forward migration', () => {
    expect(sql()).toMatch(/REVOKE\s+ALL\s+PRIVILEGES\s+ON\s+(?:TABLE\s+)?public\.treasury_citizen_budget_votes\s+FROM\s+moneyverse_app\s*,\s*PUBLIC/i);
    expect(sql()).not.toMatch(/GRANT\s+SELECT\s+ON\s+public\.treasury_citizen_budget_votes/i);
  });

  it('exposes an admin-scoped aggregate only and never a raw vote or PUBLIC EXECUTE', () => {
    expect(sql()).toMatch(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.treasury_budget_vote_totals\(\s*p_actor\s+uuid\s*,\s*p_quarter\s+text\s*\)/i);
    expect(sql()).toMatch(/SECURITY\s+DEFINER\s+SET\s+search_path/i);
    expect(sql()).toMatch(/public\.admin_current_roles\(p_actor\)/i);
    expect(sql()).toMatch(/REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.treasury_budget_vote_totals\(uuid,\s*text\)\s+FROM\s+PUBLIC/i);
    expect(sql()).toMatch(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.treasury_budget_vote_totals\(uuid,\s*text\)\s+TO\s+moneyverse_app/i);
  });

  it('routes admin aggregates through the function with authenticated actor, not raw table SQL', () => {
    expect(repo()).toMatch(/public\.treasury_budget_vote_totals\(\$1::uuid,\s*\$2::text\)/);
    expect(repo()).not.toMatch(/FROM\s+public\.treasury_citizen_budget_votes/i);
    expect(controller()).toMatch(/getGovernanceVotes\(@Req\(\)\s*request:\s*RequestWithSession/);
  });

  it.skipIf(!isolatedCI || !migratorUrl)('verifies app role and member isolation on disposable real PostgreSQL', () => {
    const url = new URL(migratorUrl!);
    if (!['postgres:', 'postgresql:'].includes(url.protocol) ||
        !['localhost', '127.0.0.1'].includes(url.hostname) ||
        (url.port !== '' && url.port !== '5432') ||
        url.username !== 'moneyverse_migrator' ||
        url.pathname !== '/woldeok_moneyverse_dev') {
      throw new Error('refuse non-disposable database');
    }
    const fixture = join(__dirname, 'fixtures', 'citizen-budget-vote-privacy-v516.sql');
    const result = spawnSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-f', fixture], {
      encoding: 'utf8', timeout: 30000,
      env: { ...process.env, PGHOST: url.hostname, PGPORT: url.port || '5432',
        PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password),
        PGDATABASE: decodeURIComponent(url.pathname.slice(1)) },
    });
    if (result.error) throw new Error(`disposable PostgreSQL unavailable: ${result.error.message}`);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('CITIZEN_BUDGET_VOTE_PRIVACY_PASS');
    expect(result.stdout).toContain('ROLLBACK');
  });
});
