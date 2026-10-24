import { describe, expect, it } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import type { WalletLoanRow } from './wallet.repository';

const OWNER = '11111111-1111-4111-8111-111111111111';
const HUGE = '900719925474099312345678901234567890';
const row = (status: string, outstanding: string, id: string): WalletLoanRow => ({
  loan_id: id,
  principal_amount: HUGE,
  interest_amount: '5',
  outstanding_amount: outstanding,
  status,
  issued_at: new Date('2026-10-20T00:00:00Z'),
  repaid_at: status === 'repaid' ? new Date('2026-10-21T00:00:00Z') : null,
});
function service(loansForUser?: (actor: string) => Promise<WalletLoanRow[]>) {
  const repository = {
    balancesForUser: async () => [],
    recentTransactionsForUser: async () => [],
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: OWNER }),
    claimDaily: async () => ({ transaction_id: OWNER, amount: '1', replayed: false }),
    ...(loansForUser ? { loansForUser } : {}),
  } as unknown as WalletRepositoryLike;
  return new WalletService(repository);
}

describe('owner-only bank loan obligations summary', () => {
  it('aggregates exact WLD strings by status, without querying other members', async () => {
    const queried: string[] = [];
    const wallet = service(async (actor) => {
      queried.push(actor);
      return [
        row('active', HUGE, '22222222-2222-4222-8222-222222222222'),
        row('overdue', '15', '33333333-3333-4333-8333-333333333333'),
        row('repaid', '0', '44444444-4444-4444-8444-444444444444'),
      ];
    });
    expect(await wallet.loanObligations(OWNER)).toEqual({
      currency: 'WLD',
      loanCount: 3,
      activeCount: 1,
      overdueCount: 1,
      repaidCount: 1,
      outstandingAmount: (BigInt(HUGE) + 15n).toString(),
      overdueOutstandingAmount: '15',
    });
    expect(queried).toEqual([OWNER]);
  });

  it('reports genuine no-loan state as zero', async () => {
    expect(await service(async () => []).loanObligations(OWNER)).toEqual({
      currency: 'WLD', loanCount: 0, activeCount: 0, overdueCount: 0, repaidCount: 0,
      outstandingAmount: '0', overdueOutstandingAmount: '0',
    });
  });

  it('fails closed on missing database read function, corrupt amounts or invalid statuses', async () => {
    await expect(service().loanObligations(OWNER)).rejects.toThrow(/unavailable/);
    await expect(service(async () => [row('active', '-1', '22222222-2222-4222-8222-222222222222')]).loanObligations(OWNER)).rejects.toThrow();
    await expect(service(async () => [row('active', '01', '22222222-2222-4222-8222-222222222222')]).loanObligations(OWNER)).rejects.toThrow();
    await expect(service(async () => [row('unknown', '5', '22222222-2222-4222-8222-222222222222')]).loanObligations(OWNER)).rejects.toThrow();
    await expect(service(async () => [row('repaid', '1', '22222222-2222-4222-8222-222222222222')]).loanObligations(OWNER)).rejects.toThrow(/repaid/);
    await expect(service(async () => []).loanObligations('other-user')).rejects.toThrow(/UUID/);
  });
});
