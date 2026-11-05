import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(join(__dirname, '../migrations/340-restrict-shop-holdings-app-acl.sql'), 'utf8');

const forbiddenGrant = /GRANT\s+.*ON\s+TABLE\s+public\.user_items/i;
const forbiddenMemberMutation = /(?:INSERT INTO|UPDATE|DELETE FROM|TRUNCATE TABLE)\s+public\./i;

describe('shop holdings app least privilege', () => {
  it('rejects representative forbidden SQL even with variable whitespace', () => {
    expect('GRANT\n SELECT ON   TABLE public.user_items TO moneyverse_app').toMatch(forbiddenGrant);
    expect('DELETE FROM public.user_items').toMatch(forbiddenMemberMutation);
    expect('UPDATE\npublic.user_items SET id = id').toMatch(forbiddenMemberMutation);
  });
  it('revokes direct access from the application role and PUBLIC', () => {
    expect(migration).toContain('REVOKE ALL PRIVILEGES ON TABLE public.user_items FROM PUBLIC, moneyverse_app');
    expect(migration).not.toMatch(forbiddenGrant);
  });
  it('fails closed on effective table and column grants', () => {
    expect(migration).toContain('has_table_privilege');
    expect(migration).toContain('has_any_column_privilege');
    expect(migration).toContain('SHOP_HOLDINGS_APP_ACL_STILL_GRANTED');
    expect(migration).toContain('COMMIT;');
  });
  it('does not modify member data or historical migrations', () => {
    expect(migration).not.toMatch(forbiddenMemberMutation);
  });
});
