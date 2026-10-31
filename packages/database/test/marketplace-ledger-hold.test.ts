import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(join(process.cwd(), 'migrations/314-marketplace-fixed-price-ledger-hold.sql'), 'utf8');

describe('forward-only fixed-price marketplace ledger hold', () => {
  it('replaces both unsafe money-mutating functions with unconditional 55000 refusal', () => {
    for (const name of ['marketplace_create_listing', 'marketplace_buy_listing']) {
      expect(migration).toContain(`CREATE OR REPLACE FUNCTION public.${name}(`);
      expect(migration).toMatch(new RegExp(`REVOKE ALL ON FUNCTION public\\.${name}\\(`));
    }
    expect(migration.match(/ERRCODE\s*=\s*'55000'/g)).toHaveLength(2);
    expect(migration).not.toMatch(/UPDATE\s+public\.account_balances/i);
    expect(migration).not.toMatch(/GRANT\s+.*moneyverse_app/i);
  });
});
