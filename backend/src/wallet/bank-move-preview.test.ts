import { describe, expect, it, vi } from 'vitest';
import { WalletInputError } from './wallet.repository';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const actor = '11111111-1111-4111-8111-111111111111';
const outsider = '22222222-2222-4222-8222-222222222222';
const date = new Date('2026-10-24T11:00:00.000Z');

function repository() {
  const balancesForUser = vi.fn(async (_owner: string) => [
    { account_type: 'USER_CASH', available_amount: '9007199254740993000', updated_at: date },
    { account_type: 'USER_BANK', available_amount: '150', updated_at: date },
  ]);
  const moveBankBalance = vi.fn();
  return {
    balancesForUser,
    moveBankBalance,
    recentTransactionsForUser: vi.fn(async () => []),
    activeRecipientById: vi.fn(async () => null),
    transfer: vi.fn(),
    claimDaily: vi.fn(),
  };
}

describe('owner-only bank movement preview', () => {
  it('reads only authenticated owner balances and keeps large integer strings exact', async () => {
    const repo = repository();
    const result = await new WalletService(repo as unknown as WalletRepositoryLike)
      .bankMovePreview(actor, { direction: 'deposit', amount: '9007199254740992999' });
    expect(repo.balancesForUser).toHaveBeenCalledExactlyOnceWith(actor);
    expect(repo.moveBankBalance).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      direction: 'deposit', amount: '9007199254740992999', canMove: true,
      cashBefore: '9007199254740993000', bankBefore: '150',
      cashAfter: '1', bankAfter: '9007199254740993149',
      maxMoveAmount: '9007199254740993000',
    });
  });

  it('returns no projected balances for insufficient bank funds and never writes', async () => {
    const repo = repository();
    const result = await new WalletService(repo as unknown as WalletRepositoryLike)
      .bankMovePreview(actor, { direction: 'withdraw', amount: '151' });
    expect(result).toMatchObject({
      direction: 'withdraw', canMove: false, maxMoveAmount: '150',
      cashAfter: null, bankAfter: null,
    });
    expect(repo.moveBankBalance).not.toHaveBeenCalled();
  });

  it('rejects invalid directions, amounts and caller identifiers without database access', async () => {
    const repo = repository();
    const service = new WalletService(repo as unknown as WalletRepositoryLike);
    for (const input of [
      { direction: 'refund', amount: '1' },
      { direction: 'deposit', amount: '0' },
      { direction: 'deposit', amount: '1e6' },
      { direction: 'deposit', amount: '9223372036854775808' },
    ]) {
      await expect(service.bankMovePreview(actor, input)).rejects.toBeInstanceOf(WalletInputError);
    }
    await expect(service.bankMovePreview('not-uuid', { direction: 'deposit', amount: '1' }))
      .rejects.toBeInstanceOf(WalletInputError);
    expect(repo.balancesForUser).not.toHaveBeenCalled();
  });

  it('refuses a preview that would overflow the bank bigint even if source funds exist', async () => {
    const repo = repository();
    repo.balancesForUser.mockResolvedValueOnce([
      { account_type: 'USER_CASH', available_amount: '200', updated_at: date },
      { account_type: 'USER_BANK', available_amount: '9223372036854775800', updated_at: date },
    ]);
    const result = await new WalletService(repo as unknown as WalletRepositoryLike)
      .bankMovePreview(actor, { direction: 'deposit', amount: '10' });
    expect(result).toMatchObject({ canMove: false, cashAfter: null, bankAfter: null });
    expect(repo.moveBankBalance).not.toHaveBeenCalled();
  });

  it('does not accept a client-selected actor and reads the requested session owner only', async () => {
    const repo = repository();
    await new WalletService(repo as unknown as WalletRepositoryLike)
      .bankMovePreview(outsider, { direction: 'withdraw', amount: '1' });
    expect(repo.balancesForUser).toHaveBeenCalledExactlyOnceWith(outsider);
  });
});
