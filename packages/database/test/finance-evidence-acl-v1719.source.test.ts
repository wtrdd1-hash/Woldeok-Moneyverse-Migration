import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SQL = join(__dirname, '../migrations/332-protect-finance-evidence-dml.sql');
const migration = readFileSync(SQL, 'utf8');

describe('v1719 financial evidence least-privilege', () => {
  it('denies direct app DML on protected finance certification and fiscal record tables', () => {
    for (const table of [
      'mint_certificates', 'retirement_certificates', 'treasury_disbursements',
      'treasury_bond_coupon_logs', 'treasury_bond_orders',
      'treasury_wealth_tax_assessments', 'national_pension_configs',
    ]) {
      expect(migration).toContain('public.'+table);
    }
    expect(migration).toContain('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER');
    expect(migration).toContain('FROM PUBLIC, moneyverse_app');
  });

  it('preserves donation reads but forbids direct rewrite or deletion', () => {
    expect(migration).toContain('ON TABLE public.treasury_donations');
    expect(migration).toContain('REVOKE UPDATE, DELETE');
    expect(migration).not.toMatch(/REVOKE SELECT/);
  });

  it('enforces effective table and column privilege postconditions or fails', () => {
    expect(migration).toContain('has_table_privilege');
    expect(migration).toContain('has_any_column_privilege');
    expect(migration).toContain('FINANCE_EVIDENCE_APP_DML_STILL_GRANTED');
    expect(migration).toContain('COMMIT;');
  });

  it('does not break active central-bank policy writers or create currency', () => {
    expect(migration).not.toContain('public.central_bank_monetary_policy');
    expect(migration).not.toContain('public.central_bank_policy_decisions');
    expect(migration).not.toContain('public.monetary_policy_orders');
    expect(migration).not.toMatch(/(?:UPDATE|INSERT INTO|DELETE FROM)\s+public\./i);
  });
});
