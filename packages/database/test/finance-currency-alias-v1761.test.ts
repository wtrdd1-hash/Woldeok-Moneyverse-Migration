import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sqlFile = join(__dirname, '../migrations/336-canonical-wld-currency-alias.sql');
const sql = readFileSync(sqlFile, 'utf8');

describe('v1761 legacy W alias normalized without a money movement', () => {
  it('changes only verified member USER_CASH currency metadata', () => {
    expect(sql).toMatch(/UPDATE\s+public\.accounts\s+SET\s+currency\s*=\s*'WLD'/i);
    expect(sql).toMatch(/WHERE\s+currency\s*=\s*'W'\s+AND\s+account_type\s*=\s*'USER_CASH'/i);
    expect(sql).toMatch(/legacy\s+currency/i);
    expect(sql).toMatch(/public\.ledger_postings/);
    expect(sql).toMatch(/public\.account_balances/);
    expect(sql).toMatch(/RAISE EXCEPTION.*CURRENCY_ALIAS_UNCERTIFIED/i);
  });

  it('prevents new obsolete currency and preserves monetary invariants', () => {
    expect(sql).toMatch(/CHECK\s*\(currency\s*=\s*'WLD'\)/i);
    expect(sql).toMatch(/CREATE TABLE.*public\.finance_currency_alias_receipts/is);
    expect(sql).toMatch(/REVOKE ALL ON TABLE public\.finance_currency_alias_receipts FROM PUBLIC,\s*moneyverse_app/i);
    expect(sql).not.toMatch(/UPDATE\s+public\.(account_balances|ledger_postings|ledger_transactions|mint_certificates)/i);
    expect(sql).not.toMatch(/INSERT INTO\s+public\.(account_balances|ledger_postings|ledger_transactions|mint_certificates)/i);
    expect(sql).not.toMatch(/GRANT\s+(?:ALL|UPDATE|INSERT|DELETE)\s+ON\s+TABLE\s+public\.accounts/i);
  });
});
