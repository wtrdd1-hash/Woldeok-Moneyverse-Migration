import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
const get = (n: string) => readFileSync(join(process.cwd(), 'migrations', n), 'utf8');
const proof = get('326-treasury-fiscal-proof-archived-reset.sql');
const forward = get('327-treasury-proof-allow-new-backed-sources.sql');
describe('v1626 reset era fiscal proof', () => {
 it('requires verified archive hashes and counts', () => {
  expect(proof).toContain('finance_reset_archive_entries');
  expect(proof).toContain('r.verified_archive_rows');
  expect(proof).toContain('r.original_row_counts');
  expect(proof).toContain('a.sha256 <> encode(public.digest(');
  expect(proof).toContain("WHEN rp.has_reset AND NOT rp.valid THEN '-1'");
 });
 it('checks only pre-epoch active legacy rows and rejects newer uncertified sources', () => {
  expect(forward).toContain('WHERE l.created_at < (SELECT opened_at FROM public.treasury_fiscal_epochs WHERE id=1)');
  expect(forward).toContain('WHERE d.created_at < (SELECT opened_at FROM public.treasury_fiscal_epochs WHERE id=1)');
  expect(forward).toContain('invalid_new_sources');
  expect(forward).toContain("WHEN rp.has_reset AND NOT rp.valid THEN '-1'");
 });
 it('does not grant raw archive read permission to app', () => {
  expect(forward).toContain('GRANT EXECUTE ON FUNCTION public.treasury_fiscal_proof_read() TO moneyverse_app');
  expect(forward).not.toMatch(/GRANT\s+SELECT\s+ON\s+(?:TABLE\s+)?public\.(?:finance_reset_archive_entries|system_treasury_ledger)/i);
 });
});
