import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(join(__dirname, '../migrations/337-restrict-shop-holdings-app-acl.sql'), 'utf8');

describe('shop holdings app least privilege', () => {
  it('revokes direct access from the application role and PUBLIC', () => {
    expect(migration).toContain('REVOKE ALL PRIVILEGES ON TABLE public.user_items FROM PUBLIC, moneyverse_app');
    expect(migration).not.toMatch(/GRANT\s+.*ON\s+TABLE\s+public\.user_items/i);
  });
  it('fails closed on effective table and column grants', () => {
    expect(migration).toContain('has_table_privilege');
    expect(migration).toContain('has_any_column_privilege');
    expect(migration).toContain('SHOP_HOLDINGS_APP_ACL_STILL_GRANTED');
    expect(migration).toContain('COMMIT;');
  });
  it('does not modify member data or historical migrations', () => {
    expect(migration).not.toMatch(/(?:INSERT INTO|UPDATE|DELETE FROM|TRUNCATE TABLE)\s+public\./i);
  });
});
