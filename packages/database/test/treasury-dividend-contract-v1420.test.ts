import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const sql = () => readFileSync(join(__dirname, '../migrations/291-ledger-first-citizen-dividend.sql'), 'utf8');
describe('v1420 treasury payout schema contract', () => {
  it('requires retry-stable key, canonical postings, beneficiary snapshot and an immutable receipt', () => {
    const source = sql();
    expect(source).toContain('p_request_key uuid');
    expect(source).toContain('public.economy_post_transaction(');
    expect(source).toContain("p_request_key,'TREASURY_CITIZEN_DIVIDEND',p_actor,NULL,");
    expect(source).not.toContain("'treasury.v1420'");
    expect(source).toContain('ledger_transaction_id');
    expect(source).toContain('request_key');
    expect(source).toContain('beneficiary_account_ids');
    expect(source).toContain('receipt');
    expect(source).toContain('insufficient certified treasury ledger balance');
    expect(source).toContain('legacy dividend signature requires an idempotency key');
    expect(source).not.toMatch(/UPDATE public.account_balances/);
  });
});
