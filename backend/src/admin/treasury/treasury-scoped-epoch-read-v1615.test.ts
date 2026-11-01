import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('v1615 fiscal proof must use DB-owned scoped read (not broad app grants)', () => {
  const repository = readFileSync(resolve(__dirname,'treasury.repository.ts'),'utf8');
  const migration = readFileSync(resolve(__dirname,'../../../../packages/database/migrations/320-treasury-scoped-fiscal-proof-read.sql'),'utf8');
  it('reads fiscal attestation through only a DB-owned scoped function', () => {
    expect(repository).toContain('public.treasury_fiscal_proof_read()');
    expect(migration).toContain('SECURITY DEFINER');
    expect(migration).toContain('OWNER TO moneyverse_migrator');
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.treasury_fiscal_proof_read\(\) TO moneyverse_app/);
    expect(migration).not.toMatch(/GRANT\s+SELECT\s+ON\s+(?:TABLE\s+)?public\.(?:treasury_fiscal_epochs|state_enterprise_dividend_logs)/i);
    expect(migration).toContain('public.treasury_fiscal_epochs');
    expect(migration).toContain('public.state_enterprise_dividend_logs');
  });
});
