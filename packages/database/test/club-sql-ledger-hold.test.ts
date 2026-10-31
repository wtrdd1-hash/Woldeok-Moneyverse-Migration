import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = resolve(process.cwd(), 'migrations/319-club-sql-ledger-hold.sql');
const sql = () => readFileSync(migration, 'utf8');

const functions = [
  { name: 'club_create', signature: 'uuid, text, text, text, text, text, uuid', result: 'TABLE' },
  { name: 'club_contribute_project', signature: 'uuid, uuid, uuid, numeric, uuid', result: 'TABLE' },
] as const;

describe('P0 club SQL ledger settlement hold v319', () => {
  it.each(functions)('replaces $name with an unconditional SQLSTATE 55000 hold', ({ name, result }) => {
    const body = sql().match(new RegExp(`CREATE OR REPLACE FUNCTION public\\.${name}\\s*\\([\\s\\S]*?\\$hold\\$;`, 'i'))?.[0];
    expect(body).toBeDefined();
    expect(body).toMatch(new RegExp(`RETURNS ${result}\\b`, 'i'));
    expect(body).toMatch(/RAISE EXCEPTION USING ERRCODE = '55000'/);
    expect(body).not.toMatch(/\b(UPDATE|INSERT|DELETE|TRUNCATE)\b/i);
  });

  it.each(functions)('revokes app and PUBLIC EXECUTE for $name', ({ name, signature }) => {
    expect(sql()).toMatch(new RegExp(`REVOKE EXECUTE ON FUNCTION public\\.${name}\\(${signature.replace(/, /g, ',\\s*')}\\) FROM PUBLIC, moneyverse_app`, 'i'));
  });

  it('matches the backend app-role DML fixture after revocation', () => {
    const fixture = readFileSync(resolve(process.cwd(), '../../backend/src/security/database-boundary.db.test.ts'), 'utf8');
    const grants = fixture.split('expect(result.rows).toEqual([').at(-1)?.split(']);')[0];
    expect(grants).toBeDefined();
    for (const table of ['club_projects', 'club_project_contributions']) {
      expect(grants).not.toContain(`table_name: '${table}'`);
    }
  });

  it('removes direct project/contribution mutations but retains non-financial club flows', () => {
    const source = sql();
    for (const table of ['club_projects', 'club_project_contributions']) {
      expect(source).toMatch(new RegExp(`REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public\\.${table} FROM PUBLIC, moneyverse_app`, 'i'));
    }
    expect(source).not.toMatch(/GRANT\s+(INSERT|UPDATE|DELETE|TRUNCATE|REFERENCES|TRIGGER|EXECUTE)\b/i);
    expect(source).not.toMatch(/REVOKE\s+(ALL|SELECT)\b/i);
    expect(source).not.toMatch(/REVOKE.*(?:club_members|club_feed_posts|public\.clubs)\b/i);
    expect(source).toMatch(/\bBEGIN;[\s\S]*COMMIT;\s*$/);
  });
});
