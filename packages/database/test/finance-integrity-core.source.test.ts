import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');
const migration = readFileSync(
  join(root, 'migrations/329-finance-integrity-core.sql'), 'utf8',
);
const compose = readFileSync(join(root, 'compose.yml'), 'utf8');

describe('v1701 internal financial integrity boundary', () => {
  it('records evidence atomically with the canonical posting function', () => {
    expect(migration).toContain('CREATE TABLE public.finance_integrity_receipts');
    expect(migration).toContain('CREATE OR REPLACE FUNCTION public.economy_post_transaction');
    expect(migration).toContain('PERFORM public.finance_integrity_assert_and_record(');
    expect(migration).toContain('COMMIT;');
    expect(migration.match(/finance_integrity_assert_and_record\(/g)?.length).toBeGreaterThan(2);
  });

  it('rechecks exact submitted postings, balances, and replay records', () => {
    expect(migration).toContain('WITH expected AS');
    expect(migration).toContain('FULL JOIN actual');
    expect(migration).toContain('o.before_amount + d.amount');
    expect(migration).toContain('finance_integrity_verify_replay(v_transaction_id)');
    expect(migration).toContain('financial replay has no protected receipt');
  });

  it('supports internal Treasury, member, bank and market proof without secondary balances', () => {
    for (const domain of ['TREASURY', 'BANK', 'MARKET', 'MEMBER_ECONOMY']) {
      expect(migration).toContain(domain);
    }
    expect(migration).not.toMatch(/CREATE TABLE public\.(?:treasury|member|market)_balance/i);
  });

  it('protects canonical journal and JSON receipt from mutation', () => {
    expect(migration).toContain('finance_integrity_ledger_transactions_immutable');
    expect(migration).toContain('finance_integrity_ledger_postings_immutable');
    expect(migration).toContain('finance_integrity_receipts_immutable');
    expect(migration).toContain('BEFORE UPDATE OR DELETE OR TRUNCATE');
  });

  it('does not expose raw settlement or financial proof to untrusted web role', () => {
    expect(migration).toMatch(
      /REVOKE EXECUTE ON FUNCTION public\.economy_post_transaction\(uuid,text,uuid,text,jsonb,text,jsonb\)\s+FROM PUBLIC,moneyverse_app/,
    );
    expect(migration).toContain('finance_integrity_scan() FROM PUBLIC,moneyverse_app');
    expect(migration).toContain('finance_integrity_receipts FROM PUBLIC, moneyverse_app');
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.finance_integrity_scan() TO moneyverse_reconciler');
  });

  it('retains authorized append-only correction without weakening journal writes', () => {
    expect(migration).toContain('finance_integrity_ledger_link_only');
    expect(migration).toContain('finance_integrity_ledger_transactions_update_guard');
    expect(migration).toContain('finance_integrity_receipts');
    expect(migration).toContain('finance_integrity_ledger_transactions_immutable');
    expect(migration).toContain("e.type='economy.transaction.reversed'");
    expect(migration).toContain("'ledger_postings', 'finance_integrity_receipts'");
  });

  it('does not publish developer DB to external network interfaces', () => {
    expect(compose).toContain('127.0.0.1:5433:5432');
    expect(compose).not.toMatch(/^\s*- ['"]?5433:5432['"]?$/m);
  });
});
