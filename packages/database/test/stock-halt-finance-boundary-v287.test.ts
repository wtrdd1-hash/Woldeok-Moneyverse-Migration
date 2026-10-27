import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = resolve(process.cwd(), 'migrations/287-stock-halt-finance-boundary-hold.sql');

const sql = () => readFileSync(migration, 'utf8');

describe('P0 stock halt treasury replay SQL containment v287', () => {
  it('fails closed both unsafe settlement and non-idempotent treasury funding functions', () => {
    const body = sql();
    expect(body).toMatch(/CREATE OR REPLACE FUNCTION public\.stock_halt_and_settle\s*\(/i);
    expect(body).toMatch(/CREATE OR REPLACE FUNCTION public\.treasury_fund_stock_halt\s*\(/i);
    expect((body.match(/ERRCODE\s*=\s*'55000'/gi) ?? [])).toHaveLength(2);
    expect(body).toMatch(/SECURITY DEFINER SET search_path = pg_catalog, pg_temp/i);
    expect(body).not.toMatch(/\b(UPDATE|INSERT|DELETE)\s+(?:INTO\s+|FROM\s+)?public\.(?:account_balances|system_treasury_vaults|system_treasury_ledger|ledger_postings)\b/i);
  });

  it('revokes PUBLIC and app execution of both unsafe entry points', () => {
    const body = sql();
    expect(body).toMatch(/REVOKE EXECUTE ON FUNCTION public\.stock_halt_and_settle\(uuid,\s*uuid,\s*uuid\) FROM PUBLIC, moneyverse_app/i);
    expect(body).toMatch(/REVOKE EXECUTE ON FUNCTION public\.treasury_fund_stock_halt\(uuid,\s*text\) FROM PUBLIC, moneyverse_app/i);
    expect(body).not.toMatch(/\bGRANT\s+EXECUTE\b/i);
  });

  it('removes direct app writes to stock halt receipts without touching other treasury consumers', () => {
    const body = sql();
    expect(body).toMatch(/REVOKE INSERT, UPDATE, DELETE ON TABLE public\.virtual_stock_halt_settlements FROM moneyverse_app/i);
    expect(body).not.toMatch(/REVOKE\s+(?:INSERT|UPDATE|DELETE).*system_treasury_(?:vaults|ledger)/i);
    expect(body).not.toMatch(/\bDROP\s+(?:TABLE|FUNCTION)\b/i);
  });

  it('preserves read-only stock halt status and receipts, without changing historical migrations', () => {
    const body = sql();
    expect(body).toMatch(/BEGIN;[\s\S]*COMMIT;/);
    expect(body).not.toMatch(/CREATE OR REPLACE FUNCTION public\.stock_halt_settlement_status/i);
    expect(body).not.toMatch(/REVOKE\s+SELECT\s+ON\s+public\.virtual_stock_halt_settlements/i);
  });
});
