import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = 'migrations/292-verified-blog-visibility-boundary.sql';

describe('QA #1661 verified blog visibility boundary', () => {
  it('revokes app-role direct article SELECT without modifying applied migration 288', () => {
    const sql = readFileSync(migration, 'utf8');
    expect(sql).toMatch(/REVOKE ALL(?: PRIVILEGES)? ON (?:TABLE )?public\.blog_verified_articles FROM PUBLIC, moneyverse_app/i);
    expect(sql).not.toMatch(/GRANT\s+SELECT\s+ON\s+(?:TABLE\s+)?public\.blog_verified_articles/i);
    expect(sql).not.toMatch(/\bUPDATE\s+public\.blog_verified_articles\b/i);
  });

  it('exposes published bodies only through bounded SECURITY DEFINER reads', () => {
    const sql = readFileSync(migration, 'utf8');
    for (const name of ['blog_verified_public_list', 'blog_verified_public_by_slug']) {
      expect(sql).toContain(`FUNCTION public.${name}(`);
    }
    expect(sql).toMatch(/SECURITY DEFINER SET search_path\s*=\s*pg_catalog,\s*pg_temp/);
    expect(sql.match(/status\s*=\s*'PUBLISHED'/g)?.length).toBeGreaterThanOrEqual(2);
    expect(sql).toMatch(/LIMIT 150/);
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.blog_verified_public_list\(\) FROM PUBLIC/);
  });

  it('keeps scheduler idempotency metadata without exposing article content', () => {
    const sql = readFileSync(migration, 'utf8');
    expect(sql).toContain('FUNCTION public.blog_verified_period_receipt(');
    expect(sql).toContain('FUNCTION public.blog_verified_recent_digests(');
    expect(sql).toMatch(/LIMIT 1000/);
    expect(sql).not.toMatch(/GRANT\s+ALL\s+ON\s+public\.blog_verified_audit/i);
  });
});
