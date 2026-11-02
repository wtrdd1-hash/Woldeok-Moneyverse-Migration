import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  join(process.cwd(), 'migrations', '325-archive-and-reset-unproven-finance.sql'), 'utf8',
);

describe('v1626 owner-authorized legacy finance reset', () => {
  it('requires verified full backup before any active legacy reset can commit', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.finance_legacy_reset_v1626(p_backup_sha text)');
    expect(sql).toContain('verified_backup_sha text := p_backup_sha;');
    expect(sql).toContain('FINANCE_RESET_VERIFIED_BACKUP_REQUIRED');
    expect(sql).toContain("pre_reset_backup_sha256");
  });

  it('archives original source payload and SHA256 before deleting any legacy row', () => {
    const archive = sql.indexOf('INSERT INTO public.finance_reset_archive_entries');
    const deletion = sql.indexOf('DELETE FROM public.system_treasury_ledger');
    expect(archive).toBeGreaterThan(0);
    expect(deletion).toBeGreaterThan(archive);
    expect(sql).toContain('public.digest(');
    expect(sql).toContain('FINANCE_RESET_ARCHIVE_COUNT_MISMATCH');
    expect(sql).toContain('finance_reset_runs');
  });

  it('does not rewrite canonical member wallets, cash, minted supply or ledger', () => {
    expect(sql).not.toMatch(/\b(?:UPDATE|DELETE FROM|TRUNCATE)\s+public\.(?:account_balances|accounts|ledger_postings|ledger_transactions|mint_certificates|pension_funded_receipts|treasury_core_receipts)\b/i);
    expect(sql).toContain('FINANCE_RESET_CANONICAL_MEMBER_OR_JOURNAL_DRIFT');
    expect(sql).toContain('FINANCE_RESET_NEW_FUNDED_ACTIVITY_PRESENT');
    expect(sql).toContain('FINANCE_RESET_CERTIFIED_OR_CURRENT_ROWS_PRESENT');
    expect(sql).toContain('FINANCE_RESET_TREASURY_MUST_BE_ZERO');
  });

  it('does not grant web application archive or monetary posting privileges', () => {
    expect(sql).toContain('REVOKE ALL ON public.finance_reset_archive_entries, public.finance_reset_runs FROM PUBLIC,moneyverse_app');
    expect(sql).toContain('REVOKE ALL ON FUNCTION public.finance_legacy_reset_v1626(text) FROM PUBLIC,moneyverse_app');
    expect(sql).not.toMatch(/\bGRANT\s+(?:INSERT|UPDATE|DELETE|EXECUTE)\s+ON\b/i);
  });
});
