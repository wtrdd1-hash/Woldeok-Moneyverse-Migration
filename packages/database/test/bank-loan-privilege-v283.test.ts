import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = 'migrations/283-bank-loan-privacy-boundary.sql';

describe('P0: bank credit evidence and loan privilege boundary', () => {
  it('revokes app/public table access while preserving scoped credit facts', () => {
    const sql = readFileSync(migration, 'utf8');
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON TABLE public\.virtual_bank_loans, public\.virtual_bank_loan_repayments FROM PUBLIC, moneyverse_app;/i);
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.bank_my_credit_facts\(p_actor uuid\)/i);
    expect(sql).toMatch(/SECURITY DEFINER/i);
    expect(sql).toMatch(/SET search_path = pg_catalog, pg_temp/i);
    expect(sql).toMatch(/WHERE l\.user_id = u\.id/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.bank_my_credit_facts\(uuid\) TO moneyverse_app;/i);
    expect(sql).not.toMatch(/GRANT\s+(?:ALL|SELECT|UPDATE|INSERT|DELETE)\s+ON\s+(?:TABLE\s+)?public\.virtual_bank_loans/i);
    const fixture = readFileSync('test/fixtures/283-bank-credit-actor.sql', 'utf8');
    expect(fixture).toContain('SET LOCAL ROLE moneyverse_app');
    expect(fixture).toMatch(/ROLLBACK;/);
  });
});
