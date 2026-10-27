import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const sql = readFileSync('migrations/286-financial-core-app-dml-boundary.sql', 'utf8');

describe('v286 financial core least privilege', () => {
  it('only revokes direct app writes for exactly the financial gate tables', () => {
    expect(sql).toMatch(/REVOKE INSERT, UPDATE, DELETE ON TABLE\s+public\.account_balances,\s+public\.accounts,\s+public\.system_treasury_vaults\s+FROM moneyverse_app;/);
    expect(sql).not.toMatch(/\b(?:INSERT\s+INTO|UPDATE\s+public\.|DELETE\s+FROM|TRUNCATE|GRANT\s+(?:INSERT|UPDATE|DELETE))\b/i);
    expect(sql).not.toMatch(/\b(?:DROP|ALTER)\s+(?:TABLE|DATABASE|ROLE)\b/i);
  });

  it('enforces all nine forbidden privileges before committing', () => {
    for (const table of ['account_balances', 'accounts', 'system_treasury_vaults']) {
      for (const privilege of ['INSERT', 'UPDATE', 'DELETE']) {
        expect(sql).toContain(`has_table_privilege('moneyverse_app', 'public.${table}', '${privilege}')`);
      }
    }
    expect(sql).toMatch(/RAISE EXCEPTION/);
  });
});
