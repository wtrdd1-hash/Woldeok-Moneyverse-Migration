import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(join(__dirname, '../migrations/312-treasury-bond-owner-read-acl.sql'), 'utf8');

describe('migration 312 treasury bond least-privilege reads', () => {
  it('has owner-scoped reads with a locked SECURITY DEFINER search path', () => {
    expect(sql).toMatch(/FUNCTION public\.bond_owner_holdings\(p_actor uuid\)/);
    expect(sql).toMatch(/FUNCTION public\.bond_owner_repo_loans\(p_actor uuid\)/);
    expect(sql).toMatch(/WHERE h\.user_id = p_actor/);
    expect(sql).toMatch(/WHERE l\.user_id = p_actor AND h\.user_id = p_actor/);
    expect((sql.match(/SECURITY DEFINER/g) ?? []).length).toBe(4);
    expect((sql.match(/SET search_path = pg_catalog, pg_temp/g) ?? []).length).toBe(4);
  });
  it('revokes raw member access and public function execution', () => {
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON TABLE public\.treasury_bond_holdings FROM PUBLIC, moneyverse_app/);
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON TABLE public\.treasury_bond_repo_loans FROM PUBLIC, moneyverse_app/);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.bond_owner_holdings\(uuid\) TO moneyverse_app/);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.bond_owner_repo_loans\(uuid\) TO moneyverse_app/);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.bond_public_catalog\(\) TO moneyverse_app/);
    expect(sql).not.toMatch(/GRANT\s+(?:SELECT|ALL).*treasury_bond_(?:holdings|repo_loans)/i);
  });
});
