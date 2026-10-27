import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.cwd(), 'migrations/281-season-reward-ledger-settlement-hold.sql');

describe('P0 season reward SQL boundary containment v281', () => {
  it('replaces the unsafe function with a fail-closed implementation', () => {
    const sql = readFileSync(path, 'utf8');
    expect(sql).toMatch(/BEGIN;[\s\S]*COMMIT;/);
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.season_claim_reward\s*\(/i);
    expect(sql).toMatch(/ERRCODE\s*=\s*'55000'/i);
    expect(sql).not.toMatch(/\bUPDATE\s+public\.account_balances\b/i);
    expect(sql).not.toMatch(/\bINSERT\s+INTO\s+public\.ledger_transactions\b/i);
  });

  it('removes PUBLIC and app execution and direct claim DML', () => {
    const sql = readFileSync(path, 'utf8');
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.season_claim_reward\(uuid,\s*uuid,\s*uuid\) FROM PUBLIC, moneyverse_app/i);
    expect(sql).toMatch(/REVOKE INSERT, UPDATE, DELETE\s+ON TABLE public\.season_reward_claims\s+FROM moneyverse_app/i);
    expect(sql).not.toMatch(/\bGRANT\s+(EXECUTE|INSERT|UPDATE|DELETE)\b/i);
  });
});
