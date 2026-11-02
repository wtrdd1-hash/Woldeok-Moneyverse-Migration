import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/324-bank-pocket-owner-read.sql', 'utf8');
const repo = readFileSync('../../backend/src/bank/bank.repository.ts', 'utf8');

describe('owner-scoped saving pocket read contract', () => {
  it('provides the function called by the authenticated Nest repository', () => {
    expect(repo).toContain('FROM public.bank_list_pockets($1)');
    expect(migration).toContain('CREATE FUNCTION public.bank_list_pockets(p_actor uuid)');
    expect(migration).toContain('WHERE p.user_id = p_actor');
    expect(migration).toContain('SET search_path = pg_catalog, pg_temp');
    expect(migration).toContain('SECURITY DEFINER');
  });
  it('does not broaden app table access or permit public function execution', () => {
    expect(migration).toContain('OWNER TO moneyverse_migrator');
    expect(migration).toContain('FROM PUBLIC, moneyverse_app');
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.bank_list_pockets(uuid) TO moneyverse_app');
    expect(migration).not.toMatch(/GRANT\s+(?:SELECT|INSERT|UPDATE|DELETE)\s+ON\s+(?:TABLE\s+)?public\.bank_saving_pockets/i);
    expect(migration).not.toMatch(/economy_post_transaction|ledger_postings/i);
  });
});
