import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = () => readFileSync(join(__dirname, '../migrations/280-wallet-owner-historical-receipt.sql'), 'utf8');

describe('migration 280: owner historical ledger receipt privilege boundary', () => {
  it('uses a single owner-scoped, immutable read function and no direct DML grants', () => {
    const sql = migration();
    expect(sql).toMatch(/SECURITY DEFINER/i);
    expect(sql).toContain('account.owner_user_id = p_actor');
    expect(sql).toContain('transaction.id = p_transaction');
    expect(sql).toContain('REVOKE ALL ON FUNCTION public.wallet_owner_transaction_receipt(uuid, uuid) FROM PUBLIC');
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.wallet_owner_transaction_receipt(uuid, uuid) TO moneyverse_app');
    expect(sql).not.toMatch(/\b(?:INSERT|UPDATE|DELETE|TRUNCATE)\b/i);
    expect(sql).not.toMatch(/\bGRANT\s+(?:SELECT|INSERT|UPDATE|DELETE|ALL)\b/i);
  });
});
