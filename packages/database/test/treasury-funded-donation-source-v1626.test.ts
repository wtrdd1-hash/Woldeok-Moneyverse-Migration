import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
const sql = readFileSync(join(process.cwd(),'migrations','328-treasury-donation-certified-epoch-source.sql'),'utf8');
describe('v1626.3 actual Treasury funding after reset', () => {
  it('requires existing WLD member cash and canonical receipt transaction link', () => {
    expect(sql).toContain("AND a.currency='WLD'");
    expect(sql).toContain('(vault_id,tx_type,amount_wld,actor_id,reason,balance_before,balance_after,ledger_transaction_id)');
    expect(sql).toContain('v_new_vault::text,v_tx_id);');
    expect(sql).toContain('public.economy_post_transaction(');
  });
  it('uses one stable caller supplied idempotency key and has no arbitrary Mint issuance', () => {
    expect(sql).toContain('p_request_key uuid');
    expect(sql).toContain('p_request_key,');
    expect(sql).toContain('SELECT d.receipt INTO v_receipt');
    expect(sql).not.toMatch(/\b(?:UPDATE|INSERT INTO)\s+public\.(?:ledger_postings|ledger_transactions|account_balances|mint_certificates)\b/i);
  });
  it('remains application-callable solely for the existing settlement function', () => {
    expect(sql).toContain('ALTER FUNCTION public.treasury_user_donate(uuid,text,text,uuid) OWNER TO moneyverse_migrator;');
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.treasury_user_donate(uuid,text,text,uuid) TO moneyverse_app;');
  });
});
