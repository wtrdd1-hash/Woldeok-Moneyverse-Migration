import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sqlPath = resolve(process.cwd(), 'migrations/283-space-finance-ledger-boundary-hold.sql');

describe('P0 #1502 space/city/property tax SQL boundary v283', () => {
  const readSql = () => readFileSync(sqlPath, 'utf8');

  it.each([
    ['space_purchase', 'uuid, text, text, uuid'],
    ['city_project_contribute', 'uuid, uuid, numeric, uuid'],
    ['space_pay_property_tax', 'uuid, uuid, integer, uuid'],
  ])('blocks unsafe %s at SQL function and role boundaries', (name, signature) => {
    const sql = readSql();
    expect(sql).toMatch(new RegExp('CREATE OR REPLACE FUNCTION public\\.' + name + '\\s*\\(', 'i'));
    expect(sql).toMatch(new RegExp('REVOKE EXECUTE ON FUNCTION public\\.' + name + '\\(' + signature.replace(/, /g, ',\\s*') + '\\) FROM PUBLIC, moneyverse_app', 'i'));
    expect(sql).toMatch(/MESSAGE\s*=\s*'[^']*ledger[^']*unavailable'/i);
  });

  it('fails closed without balance/ledger writes or broad grants', () => {
    const sql = readSql();
    expect(sql).toMatch(/BEGIN;[\s\S]*COMMIT;\s*$/);
    expect((sql.match(/ERRCODE\s*=\s*'55000'/g) ?? [])).toHaveLength(3);
    expect(sql).not.toMatch(/\bUPDATE\s+public\.account_balances\b/i);
    expect(sql).not.toMatch(/\bINSERT\s+INTO\s+public\.ledger_transactions\b/i);
    expect(sql).not.toMatch(/\bGRANT\s+(INSERT|UPDATE|DELETE)\b/i);
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.space_update_layout\s*\(/i);
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.space_update_layout\(uuid,\s*uuid,\s*jsonb\) FROM PUBLIC/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.space_update_layout\(uuid,\s*uuid,\s*jsonb\) TO moneyverse_app/i);
    for (const table of ['user_spaces', 'city_projects', 'city_project_contributions', 'space_property_tax_payments']) {
      expect(sql).toMatch(new RegExp('REVOKE INSERT, UPDATE, DELETE ON TABLE public\\.' + table + ' FROM moneyverse_app', 'i'));
    }
  });
});
