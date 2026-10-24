import { describe, expect, it } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const LOAN = '22222222-2222-4222-8222-222222222222';
const HUGE = '90071992547409931234567890123456789012';

function repo(rows: unknown[], actorCheck?: (actor: string) => void): WalletRepositoryLike {
  return {
    balancesForUser: async () => [],
    recentTransactionsForUser: async () => [],
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: LOAN }),
    claimDaily: async () => ({ transaction_id: LOAN, amount: '1', replayed: false }),
    loansForUser: async (actor: string) => { actorCheck?.(actor); return rows as Awaited<ReturnType<NonNullable<WalletRepositoryLike['loansForUser']>>>; },
  } as WalletRepositoryLike;
}

function loan(status: string, outstanding: string) {
  return { loan_id: LOAN, principal_amount: '100', interest_amount: '10', outstanding_amount: outstanding,
    status, issued_at: new Date('2026-10-20T00:00:00Z'), repaid_at: status === 'repaid' ? new Date('2026-10-21T00:00:00Z') : null };
}

describe('owner-only loan exposure summary', () => {
  it('uses the authenticated actor and sums huge integer-string balances exactly', async () => {
    const service = new WalletService(repo([loan('active', HUGE), loan('overdue', '25'), loan('repaid', '0')],
      (actor) => expect(actor).toBe(ACTOR)));
    await expect(service.loanExposure(ACTOR)).resolves.toEqual({
      scope: 'latest-20', totalLoans: 3, activeCount: 1, overdueCount: 1, repaidCount: 1,
      outstandingAmount: (BigInt(HUGE) + 25n).toString(), overdueAmount: '25', currency: 'WLD',
    });
  });

  it('returns verified zero only after the owner database function returns an empty list', async () => {
    await expect(new WalletService(repo([])).loanExposure(ACTOR)).resolves.toMatchObject({
      totalLoans: 0, outstandingAmount: '0', overdueAmount: '0',
    });
  });

  it('does not invent a zero when the database read function is unavailable', async () => {
    const repository = repo([]);
    delete repository.loansForUser;
    await expect(new WalletService(repository).loanExposure(ACTOR)).rejects.toThrow(/unavailable/i);
  });

  it('rejects invalid or noncanonical database amounts instead of rounding', async () => {
    await expect(new WalletService(repo([loan('active', '01')])).loanExposure(ACTOR)).rejects.toThrow();
    await expect(new WalletService(repo([loan('repaid', '2')])).loanExposure(ACTOR)).rejects.toThrow();
  });

  it('rejects malformed actors before touching the database', async () => {
    await expect(new WalletService(repo([])).loanExposure('not-a-uuid')).rejects.toThrow();
  });
});
