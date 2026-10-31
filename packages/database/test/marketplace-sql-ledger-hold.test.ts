import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = resolve(process.cwd(), 'migrations/318-marketplace-sql-ledger-hold.sql');
const sql = () => readFileSync(migration, 'utf8');

const unsafe = [
  { name: 'marketplace_create_listing', signature: 'uuid, text, integer, text, text, text', result: 'uuid' },
  { name: 'marketplace_buy_listing', signature: 'uuid, uuid, text', result: 'uuid' },
  { name: 'marketplace_bid_auction', signature: 'uuid, text, uuid, text', result: 'jsonb' },
] as const;

describe('P0 #2191 marketplace SQL settlement fail-closed v318', () => {
  it.each(unsafe)('replaces %s with an unconditional SQLSTATE 55000 hold', ({ name, result }) => {
    const source = sql();
    const body = source.match(new RegExp(`CREATE OR REPLACE FUNCTION public\\.${name}\\s*\\([\\s\\S]*?\\$hold\\$;`, 'i'))?.[0];
    expect(body).toBeDefined();
    expect(body).toMatch(new RegExp(`RETURNS ${result}\\b`, 'i'));
    expect(body).toMatch(/RAISE EXCEPTION USING ERRCODE = '55000'/);
    expect(body).not.toMatch(/\b(UPDATE|INSERT|DELETE|TRUNCATE)\b/i);
    expect(body).not.toMatch(/economy_post_transaction/i);
  });

  it.each(unsafe)('revokes app and PUBLIC EXECUTE for $name', ({ name, signature }) => {
    const pattern = new RegExp(`REVOKE EXECUTE ON FUNCTION public\\.${name}\\(${signature.replace(/, /g, ',\\s*')}\\) FROM PUBLIC, moneyverse_app`, 'i');
    expect(sql()).toMatch(pattern);
  });

  it('revokes direct app financial mutations while preserving read access', () => {
    const source = sql();
    for (const table of ['account_balances', 'accounts', 'ledger_transactions', 'ledger_postings', 'outbox_events', 'audit_logs']) {
      expect(source).toMatch(new RegExp(`REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public\\.${table} FROM PUBLIC, moneyverse_app`, 'i'));
    }
    expect(source).not.toMatch(/GRANT\s+(INSERT|UPDATE|DELETE|TRUNCATE|EXECUTE)\b/i);
    expect(source).not.toMatch(/REVOKE\s+(ALL|SELECT)\b/i);
    expect(source).toMatch(/\bBEGIN;[\s\S]*COMMIT;\s*$/);
  });
});
