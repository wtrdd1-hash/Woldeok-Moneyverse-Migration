import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const script = readFileSync(join(__dirname, 'user-items-acl-drift.pg.sh'), 'utf8');

describe('user_items ACL drift gate single-session safety', () => {
  it('runs presence and privilege checks in one read-only PostgreSQL transaction', () => {
    expect((script.match(/psql "\$DATABASE_URL"/g) ?? [])).toHaveLength(1);
    expect(script).toContain("-c 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY'");
    expect(script).toContain('user-items-acl-schema-presence.verify.sql');
    expect(script).toContain('user-items-acl-drift.readonly.sql');
    expect(script).toContain("-c 'ROLLBACK'");
    expect(script.indexOf('user-items-acl-schema-presence.verify.sql')).toBeLessThan(
      script.indexOf('user-items-acl-drift.readonly.sql'),
    );
    expect(script).toContain('ON_ERROR_STOP=1');
  });
});
