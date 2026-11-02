import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sqlPath = resolve(process.cwd(), 'migrations/324-burn-draw-ledger-hold.sql');

describe('P0 burn draw immutable SQL ledger containment v324', () => {
  it('replaces the unsafe SECURITY DEFINER function with an explicit fail-closed body', () => {
    const sql = readFileSync(sqlPath, 'utf8');
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.participate_anti_inflation_burn_draw\s*\(/i);
    expect(sql).toMatch(/ERRCODE\s*=\s*'55000'/i);
    expect(sql).not.toMatch(/\bUPDATE\s+public\.account_balances\b/i);
    expect(sql).not.toMatch(/\bINSERT\s+INTO\s+public\.ledger_entries\b/i);
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.participate_anti_inflation_burn_draw\(uuid,\s*numeric\) FROM PUBLIC, moneyverse_app/i);
    expect(sql).not.toMatch(/\bGRANT\s+(EXECUTE|INSERT|UPDATE|DELETE)\b/i);
  });
});
