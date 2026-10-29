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
  it('returns actual approved publication timestamps from both public read functions', () => {
    expect(sql).toMatch(/RETURNS TABLE\(article_id uuid, locale text, slug text, category text, title text, summary text, published_at timestamptz\)/i);
    expect(sql).toMatch(/RETURNS TABLE\(article_id uuid, locale text, slug text, category text, title text, summary text, body_plain text, source_url text, published_at timestamptz\)/i);
    expect(sql).toMatch(/r\.approved_by <> r\.author_id AND r\.reviewed_until > clock_timestamp\(\)/);
  });
  it('pins security definer search path and revokes public function execute', () => {
    expect(sql).toMatch(/SECURITY DEFINER\s+SET search_path\s*=\s*pg_catalog,\s*pg_temp/i);
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.help_public_search\([^)]+\) FROM PUBLIC/i);
  });
});

describe('approved related-help database fixture', () => {
  it('uses the same published-only SECURITY DEFINER reads without new grants', () => {
    const fixture = readFileSync(join(__dirname, 'fixtures/282-help-related.sql'), 'utf8');
    expect(fixture).toContain('public.help_public_search');
    expect(fixture).toContain('public.help_public_article');
    expect(fixture).toContain('SET ROLE moneyverse_app');
    expect(fixture).toContain('insufficient_privilege');
    expect(fixture).not.toMatch(/GRANT\s+(?:SELECT|INSERT|UPDATE|DELETE)\s+ON/i);
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


describe('help category counts migration', () => {
  const migration = readFileSync(join(__dirname, '../migrations/295-verified-help-category-counts.sql'), 'utf8');
  it('counts only published, independently approved and unexpired articles', () => {
    expect(migration).toMatch(/help_public_category_counts/);
    expect(migration).toMatch(/state\s*=\s*'published'/);
    expect(migration).toMatch(/approved_by\s+IS NOT NULL/i);
    expect(migration).toMatch(/approved_by\s*<>\s*r\.author_id/i);
    expect(migration).toMatch(/reviewed_until\s*>\s*clock_timestamp\(\)/i);
  });
  it('keeps the database boundary least-privileged', () => {
    expect(migration).toMatch(/SECURITY DEFINER\s+SET search_path\s*=\s*pg_catalog,\s*pg_temp/i);
    expect(migration).toMatch(/REVOKE ALL ON FUNCTION public\.help_public_category_counts\(text\) FROM PUBLIC, moneyverse_app/i);
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.help_public_category_counts\(text\) TO moneyverse_app/i);
    expect(migration).not.toMatch(/GRANT .* ON TABLE .* TO moneyverse_app/i);
  });
});
