import { describe, expect, it, vi } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletInputError } from './wallet.repository';
import type { RequestWithSession } from '../auth/session.context';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const LOAN = '22222222-2222-4222-8222-222222222222';
const rows = [
  { loan_id: LOAN, principal_amount: '90071992547409931234567890', interest_amount: '1', outstanding_amount: '90071992547409931234567891', status: 'overdue', issued_at: new Date('2026-09-01T00:00:00Z'), repaid_at: null },
  { loan_id: '33333333-3333-4333-8333-333333333333', principal_amount: '5', interest_amount: '0', outstanding_amount: '0', status: 'repaid', issued_at: new Date('2026-09-02T00:00:00Z'), repaid_at: new Date('2026-09-03T00:00:00Z') },
];

function fakeRepository(loansForUser: () => Promise<typeof rows>): WalletRepositoryLike {
  return {
    loansForUser,
    balancesForUser: async () => [],
    recentTransactionsForUser: async () => [],
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: LOAN }),
    claimDaily: async () => ({ transaction_id: LOAN, amount: '1', replayed: false }),
  } as unknown as WalletRepositoryLike;
}

describe('owner-only loan history status filter', () => {
  it('filters overdue without converting 26-digit WLD to a number', async () => {
    const loansForUser = vi.fn(async () => rows);
    const service = new WalletService(fakeRepository(loansForUser));
    const result = await service.loans(ACTOR, 'overdue');
    expect(loansForUser).toHaveBeenCalledWith(ACTOR);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ loanId: LOAN, status: 'overdue', outstandingAmount: '90071992547409931234567891' });
  });

  it('returns all owner loans by default and only repaid when selected', async () => {
    const service = new WalletService(fakeRepository(async () => rows));
    expect(await service.loans(ACTOR)).toHaveLength(2);
    expect((await service.loans(ACTOR, 'repaid')).map((loan) => loan.status)).toEqual(['repaid']);
    expect(await service.loans(ACTOR, 'all')).toHaveLength(2);
  });

  it('rejects invalid status before any database read', async () => {
    const loansForUser = vi.fn(async () => rows);
    const service = new WalletService(fakeRepository(loansForUser));
    await expect(service.loans(ACTOR, 'pending')).rejects.toBeInstanceOf(WalletInputError);
    expect(loansForUser).not.toHaveBeenCalled();
  });

  it('passes the authenticated actor and selected filter through the controller', async () => {
    const loans = vi.fn(async () => []);
    const controller = new WalletController({ loans } as unknown as WalletService);
    const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
    await expect(controller.loans(request, 'overdue')).resolves.toEqual({ loans: [] });
    expect(loans).toHaveBeenCalledWith(ACTOR, 'overdue');
  });
});
