import { describe, expect, it, vi } from 'vitest';
import { KdicRepository } from './kdic.repository';
import { AdminKdicController } from './kdic.controller';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { KdicService } from './kdic.service';

const sample = {
  checkedAt: '2026-10-30T01:00:00.000Z',
  transactionCount: '891',
  postingCount: '1829',
  accountCount: '40',
  unbalancedTransactionCount: '0',
  mismatchedAccountCount: '0',
  absoluteDifferenceWld: '0',
  unlinkedTreasuryCount: '552',
  treasuryRecordCount: '552',
};

describe('KDIC administrator ledger diagnostics', () => {
  it('inherits administrator and administrator-session guards', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AdminKdicController) as Array<{ name: string }>;
    expect(guards.map((g) => g.name)).toEqual(expect.arrayContaining(['AdminGuard', 'AdminSessionGuard']));
  });

  it('queries the ledger using read-only SQL and never invokes financial writers', async () => {
    const pool = { query: vi.fn().mockResolvedValue({ rows: [sample] }), connect: vi.fn() };
    const repo = new KdicRepository(pool as never);
    const result = await repo.getLedgerIntegrity();
    expect(result).toEqual(sample);
    expect(pool.query).toHaveBeenCalledTimes(1);
    const sql = String(pool.query.mock.calls[0][0]);
    expect(sql).toMatch(/ledger_postings/);
    expect(sql).toMatch(/account_balances/);
    expect(sql).toMatch(/system_treasury_ledger/);
    expect(sql).not.toMatch(/INSERT|UPDATE|DELETE|TRUNCATE|CALL\s|ledger_capture_reconciliation/i);
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it('never certifies settlement from a balanced journal when treasury provenance is missing', async () => {
    const svc = new KdicService({ getLedgerIntegrity: vi.fn().mockResolvedValue(sample) } as never);
    const result = await svc.getLedgerIntegrity();
    expect(result.settlementReady).toBe(false);
    expect(result.numericBalanced).toBe(true);
    expect(result.state).toBe('BLOCKED');
    expect(result.blockers).toContain('TREASURY_ROWS_WITHOUT_CANONICAL_LINK');
    expect(result.blockers).toContain('KDIC_WRITERS_UNVERIFIED');
  });

  it('marks projection drift as a blocker and fails closed on invalid database evidence', async () => {
    const repo = { getLedgerIntegrity: vi.fn().mockResolvedValue({ ...sample, mismatchedAccountCount: '2', absoluteDifferenceWld: '1000' }) };
    const svc = new KdicService(repo as never);
    const state = await svc.getLedgerIntegrity();
    expect(state.numericBalanced).toBe(false);
    expect(state.blockers).toContain('BALANCE_PROJECTION_MISMATCH');
    repo.getLedgerIntegrity.mockResolvedValue({ ...sample, unlinkedTreasuryCount: '-1' });
    await expect(svc.getLedgerIntegrity()).rejects.toThrow();
  });
});
