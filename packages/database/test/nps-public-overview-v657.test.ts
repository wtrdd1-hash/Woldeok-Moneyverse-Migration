import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(resolve(__dirname, '../migrations/308-pension-public-overview-scoped-read.sql'), 'utf8');

describe('NPS public overview read-only ACL migration 308', () => {
  it('exposes a read-only aggregate through a hardened SECURITY DEFINER function', () => {
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.pension_public_overview\(\)/);
    expect(migration).toMatch(/\bSTABLE\s+SECURITY DEFINER\s+SET search_path = pg_catalog, pg_temp/);
    expect(migration).toMatch(/ALTER FUNCTION public\.pension_public_overview\(\) OWNER TO moneyverse_migrator/);
    expect(migration).toMatch(/REVOKE ALL PRIVILEGES ON FUNCTION public\.pension_public_overview\(\) FROM PUBLIC, moneyverse_app/);
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.pension_public_overview\(\) TO moneyverse_app/);
  });

  it('never grants raw table access or changes pension money and settlement rows', () => {
    expect(migration).not.toMatch(/\b(?:INSERT|UPDATE|DELETE|TRUNCATE|ALTER TABLE)\b/i);
    expect(migration).not.toMatch(/GRANT\s+(?:ALL|SELECT|INSERT|UPDATE|DELETE)\s+ON\s+TABLE/i);
    expect(migration).toMatch(/WHERE a\.status <> 'LIQUIDATED'/);
  });
});
