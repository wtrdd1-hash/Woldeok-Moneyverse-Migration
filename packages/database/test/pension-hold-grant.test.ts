import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('P0 NPS privilege fail-closed migration v275', () => {
  it('revokes all cash-moving log writes and direct pension position edits', () => {
    const sql = readFileSync(resolve(process.cwd(), 'migrations/275-pension-ledger-settlement-hold.sql'), 'utf8');
    expect(sql).toMatch(/BEGIN;[\s\S]*COMMIT;/);
    expect(sql).toMatch(/REVOKE\s+INSERT,\s*UPDATE,\s*DELETE\s+ON TABLE public\.national_pension_payout_logs\s+FROM moneyverse_app/i);
    expect(sql).toMatch(/REVOKE\s+INSERT,\s*UPDATE,\s*DELETE\s+ON TABLE public\.national_pension_contributions\s+FROM moneyverse_app/i);
    expect(sql).toMatch(/REVOKE\s+UPDATE,\s*DELETE\s+ON TABLE public\.national_pension_accounts\s+FROM moneyverse_app/i);
    expect(sql).not.toMatch(/\bGRANT\s+(INSERT|UPDATE|DELETE)/i);
  });
});
