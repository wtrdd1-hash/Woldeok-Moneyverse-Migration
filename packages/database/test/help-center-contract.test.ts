import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(join(__dirname, '../migrations/282-verified-help-center.sql'), 'utf8');

describe('help center migration boundary', () => {
  it('does not collide with qualification 280 or season 281', () => {
    const files = readdirSync(join(__dirname, '../migrations'));
    expect(files.filter(name => /^28[012]-/.test(name)).sort()).toEqual([
      '280-qualification-ledger-settlement-hold.sql',
      '281-season-reward-ledger-settlement-hold.sql',
      '282-verified-help-center.sql',
    ]);
  });
  it('restricts reads to published unexpired revisions and grants no table DML', () => {
    expect(sql).toMatch(/help_public_search/);
    expect(sql).toMatch(/reviewed_until\s*>\s*(?:clock_timestamp|now)\(/i);
    expect(sql).toMatch(/REVOKE ALL ON TABLE public\.help_articles FROM PUBLIC, moneyverse_app/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.help_public_search/i);
    expect(sql).not.toMatch(/GRANT (?:INSERT|UPDATE|DELETE|ALL) ON TABLE public\.help_articles TO moneyverse_app/i);
  });
  it('caps the published-only search at 50 results even when called directly', () => {
    expect(sql).toMatch(/LIMIT greatest\(1,least\(coalesce\(p_limit,20\),50\)\)/i);
  });
  it('pins security definer search path and revokes public function execute', () => {
    expect(sql).toMatch(/SECURITY DEFINER\s+SET search_path\s*=\s*pg_catalog,\s*pg_temp/i);
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.help_public_search\([^)]+\) FROM PUBLIC/i);
  });
});

describe('independent publication boundary', () => {
  it('requires current console session, independent approver and immutable replay key', () => {
    expect(sql).toMatch(/public\.admin_session_touch\(/);
    expect(sql).toMatch(/'approver'::public\.admin_role/);
    expect(sql).toMatch(/v_revision\.author_id\s*=\s*p_actor/);
    expect(sql).toMatch(/request_key uuid NOT NULL UNIQUE/);
    expect(sql).toMatch(/CREATE FUNCTION public\.help_admin_publish/);
    expect(sql).toMatch(/CREATE FUNCTION public\.help_admin_retract/);
  });
});
