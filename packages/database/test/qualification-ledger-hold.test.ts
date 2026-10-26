import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = resolve(process.cwd(), 'migrations/280-qualification-ledger-settlement-hold.sql');
const sql = existsSync(path) ? readFileSync(path, 'utf8') : '';

describe('P0 qualification ledger containment migration 280', () => {
  it('is forward-only, transactional and does not modify historical balances', () => {
    expect(sql).toMatch(/\bBEGIN\s*;/i);
    expect(sql).toMatch(/\bCOMMIT\s*;/i);
    expect(sql).not.toMatch(/\b(?:UPDATE|INSERT\s+INTO|DELETE\s+FROM)\s+public\.(?:account_balances|accounts|ledger_transactions|ledger_postings|system_treasury_vaults|system_treasury_ledger)\b/i);
  });

  it('replaces the legacy certification entrypoint with an unconditional fail-closed body', () => {
    expect(sql).toMatch(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.job_certify_qualification\s*\(\s*p_actor\s+uuid\s*,\s*p_job_type\s+text\s*,\s*p_code\s+text\s*\)\s*RETURNS\s+jsonb/i);
    expect(sql).toMatch(/SECURITY\s+DEFINER\s+SET\s+search_path\s*=\s*pg_catalog\s*,\s*public/i);
    expect(sql).toMatch(/RAISE\s+EXCEPTION\s+'[^']+'\s+USING\s+ERRCODE\s*=\s*'55000'/i);
    expect(sql).not.toMatch(/\beconomy_post_transaction\s*\(/i);
  });

  it('revokes PUBLIC and app execution as well as direct qualification writes', () => {
    expect(sql).toMatch(/REVOKE\s+ALL\s+(?:PRIVILEGES\s+)?ON\s+FUNCTION\s+public\.job_certify_qualification\s*\(\s*uuid\s*,\s*text\s*,\s*text\s*\)\s+FROM\s+PUBLIC\s*,\s*moneyverse_app\s*;/i);
    expect(sql).toMatch(/REVOKE\s+INSERT\s*,\s*UPDATE\s*,\s*DELETE\s+ON\s+TABLE\s+public\.user_job_qualifications\s+FROM\s+PUBLIC\s*,\s*moneyverse_app\s*;/i);
    expect(sql).not.toMatch(/\bGRANT\s+(?:EXECUTE|INSERT|UPDATE|DELETE)\b/i);
  });
});
