import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(join(__dirname, 'user-items-acl-drift.readonly.sql'), 'utf8');
const forbiddenWrite = /\b(INSERT INTO|UPDATE\s+\w|DELETE FROM|ALTER|GRANT|REVOKE|TRUNCATE\s+(?:TABLE\s+)?[a-z_]+|DROP|CREATE)\b/i;
const withoutComments = (source: string) => source.replace(/--[^\n]*/g, '').trim();

describe('read-only user_items ACL drift diagnostic', () => {
  it('detects direct and effective grants for every table privilege', () => {
    for (const privilege of ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) {
      expect(sql).toContain(`('${privilege}')`);
    }
    expect(sql).toContain('aclexplode(t.relacl)');
    expect(sql).toContain('has_table_privilege');
    expect(sql).toMatch(/WHERE direct_grant OR effective_grant/);
  });
  it('read-only guard ignores comments but rejects writes', () => {
    const comment = '-- UPDATE accounts SET balance = 0\nWITH data AS (SELECT 1) SELECT * FROM data';
    expect(withoutComments(comment)).toMatch(/^WITH\s/i);
    expect(withoutComments(comment)).not.toMatch(forbiddenWrite);
    expect('DELETE FROM accounts').toMatch(forbiddenWrite);
    expect('UPDATE accounts SET balance = 0').toMatch(forbiddenWrite);
  });
  it('cannot change shared database state', () => {
    const executable = withoutComments(sql);
    expect(executable).toMatch(/^WITH\s/i);
    expect(executable).not.toMatch(forbiddenWrite);
  });
});
