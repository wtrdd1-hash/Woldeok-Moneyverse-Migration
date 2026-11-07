import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = join(__dirname, '..', 'migrations', '324-core-sensitive-app-acl.sql');
const protectedTables = [
  'account_balances', 'accounts', 'daily_rewards', 'outbox_events',
  'users', 'identities', 'user_items',
] as const;

describe('P0: direct app access to sensitive state is never a write boundary', () => {
  it('revokes direct privileges from PUBLIC and moneyverse_app on all seven sensitive tables', () => {
    const sql = readFileSync(migration, 'utf8');
    expect(sql).toMatch(/REVOKE\s+ALL\s+PRIVILEGES\s+ON\s+TABLE[\s\S]*?FROM\s+PUBLIC\s*,\s*moneyverse_app\s*;/i);
    for (const table of protectedTables) {
      expect(sql).toContain(`public.${table}`);
    }
    expect(sql).not.toMatch(/GRANT\s+(?:ALL|INSERT|UPDATE|DELETE|TRUNCATE)\s+ON\s+(?:TABLE\s+)?public\./i);
  });

  it('restores SELECT only for four existing economy read models', () => {
    const sql = readFileSync(migration, 'utf8');
    expect(sql).toMatch(/GRANT\s+SELECT\s+ON\s+TABLE\s+public\.account_balances\s*,\s*public\.accounts\s*,\s*public\.daily_rewards\s*,\s*public\.outbox_events\s+TO\s+moneyverse_app\s*;/i);
    expect(sql).not.toMatch(/GRANT\s+SELECT[\s\S]*?public\.(?:users|identities|user_items)/i);
  });
});
