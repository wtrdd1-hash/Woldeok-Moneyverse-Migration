import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const sql = readFileSync(join(__dirname, '../migrations/311-verified-blog-admin-scoped-read.sql'), 'utf8');

describe('blog admin least privilege migration 311', () => {
  it('enforces actor role and only returns bounded published and withdrawn articles', () => {
    expect(sql).toMatch(/admin_current_roles\(p_actor\)/);
    expect(sql).toMatch(/ERRCODE\s*=\s*'42501'/);
    expect(sql).toMatch(/'PUBLISHED'\s*,\s*'WITHDRAWN'/);
    expect(sql).toMatch(/LIMIT 200/);
  });
  it('does not grant unrestricted table access or public function execution', () => {
    expect(sql).toMatch(/REVOKE ALL.*blog_verified_articles FROM PUBLIC, moneyverse_app/i);
    expect(sql).toMatch(/REVOKE ALL.*blog_verified_admin_list\(uuid\) FROM PUBLIC, moneyverse_app/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.blog_verified_admin_list\(uuid\) TO moneyverse_app/i);
    expect(sql).not.toMatch(/GRANT\s+(?:SELECT|ALL).*blog_verified_articles/i);
  });
});
