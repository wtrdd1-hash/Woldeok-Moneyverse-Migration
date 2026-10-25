import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = join(__dirname, '..', 'migrations', '282-pension-owner-read-functions.sql');

describe('pension member read migration security contract', () => {
  it('restricts function execution to the application role and pins definer search path', () => {
    const sql = readFileSync(path, 'utf8');
    for (const [fn, args] of [
      ['pension_member_account', 'uuid'],
      ['pension_member_contributions', 'uuid, integer'],
      ['pension_member_payouts', 'uuid, integer'],
    ]) {
      expect(sql).toContain(`ALTER FUNCTION public.${fn}(${args}) OWNER TO moneyverse_migrator`);
      expect(sql).toContain(`REVOKE ALL PRIVILEGES ON FUNCTION public.${fn}(${args}) FROM PUBLIC, moneyverse_app`);
      expect(sql).toContain(`GRANT EXECUTE ON FUNCTION public.${fn}(${args}) TO moneyverse_app`);
    }
    expect((sql.match(/SECURITY DEFINER/g) ?? []).length).toBe(3);
    expect((sql.match(/SET search_path = pg_catalog, pg_temp/g) ?? []).length).toBe(3);
    expect(sql).not.toMatch(/GRANT\s+SELECT\s+ON\s+TABLE/i);
  });
});
