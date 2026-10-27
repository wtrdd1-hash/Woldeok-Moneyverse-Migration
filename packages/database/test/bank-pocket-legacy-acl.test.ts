import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const path = 'migrations/284-bank-pocket-legacy-overload-acl.sql';

describe('P0 bank pocket legacy text-key EXECUTE boundary', () => {
  it.each([
    'bank_archive_pocket(text,uuid,uuid)',
    'bank_customize_pocket(text,uuid,uuid,text,text)',
    'bank_transfer_pocket(text,uuid,uuid,bigint,text)',
  ])('revokes PUBLIC and app execution of %s when present', (signature) => {
    const sql = readFileSync(path, 'utf8');
    expect(sql).toContain(`to_regprocedure('public.${signature}')`);
    expect(sql).toContain(`REVOKE EXECUTE ON FUNCTION public.${signature} FROM PUBLIC, moneyverse_app`);
  });

  it('does not change the authorized UUID-key overloads or grant privileges', () => {
    const sql = readFileSync(path, 'utf8');
    expect(sql).not.toMatch(/\bGRANT\b/i);
    expect(sql).not.toMatch(/REVOKE[^;]+bank_(?:archive|customize|transfer)_pocket\(uuid/i);
    expect(sql).toMatch(/BEGIN;[\s\S]*COMMIT;\s*$/);
  });
});
