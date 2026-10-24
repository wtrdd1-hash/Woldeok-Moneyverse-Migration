import { describe, expect, it, vi } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const LOAN = '22222222-2222-4222-8222-222222222222';
const FOREIGN = '33333333-3333-4333-8333-333333333333';
const HUGE = '90071992547409931234567890123456789012';

function repository(available = true): WalletRepositoryLike {
  return {
    balancesForUser: async () => [],
    recentTransactionsForUser: async () => [],
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: LOAN }),
    claimDaily: async () => ({ transaction_id: LOAN, amount: '1', replayed: false }),
    ...(available ? { loansForUser: vi.fn(async (actor: string) => actor === ACTOR ? [{
      loan_id: LOAN,
      principal_amount: HUGE,
      interest_amount: '3',
      outstanding_amount: HUGE,
      status: 'active',
      issued_at: new Date('2026-10-24T00:00:00Z'),
      repaid_at: null,
    }] : []) } : {}),
  } as WalletRepositoryLike;
}

describe('owner-scoped virtual loan detail', () => {
  it('returns only the authenticated owner loan with exact WLD precision', async () => {
    const repo = repository();
    const loan = await new WalletService(repo).loanById(ACTOR, LOAN);
    expect(repo.loansForUser).toHaveBeenCalledWith(ACTOR);
    expect(loan).toMatchObject({ loanId: LOAN, principalAmount: HUGE, outstandingAmount: HUGE, status: 'active' });
  });
  it('does not expose a foreign or nonexistent loan', async () => {
    const wallet = new WalletService(repository());
    await expect(wallet.loanById(ACTOR, FOREIGN)).resolves.toBeNull();
    await expect(wallet.loanById(FOREIGN, LOAN)).resolves.toBeNull();
  });
  it('rejects malformed loan ids before querying', async () => {
    const repo = repository();
    await expect(new WalletService(repo).loanById(ACTOR, 'not-a-uuid')).rejects.toThrow(/UUID/);
    expect(repo.loansForUser).not.toHaveBeenCalled();
  });
  it('fails closed if the authoritative database read is unavailable', async () => {
    await expect(new WalletService(repository(false)).loanById(ACTOR, LOAN)).rejects.toThrow(/unavailable/i);
  });
});
