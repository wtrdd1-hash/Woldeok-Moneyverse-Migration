import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import type { RequestWithSession } from '../auth/session.context';
import type { BankRepository } from './bank.repository';
import { BankController } from './bank.controller';
import { buildInterestClaimPreview } from './interest-claim-preview';

const actor = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('bank accrued-interest claim preview', () => {
  it('preserves arbitrary-size integer-string WLD and does not write', () => {
    const bank = '900719925474099312345678901234567890';
    const interest = '98765432101234567890';
    expect(buildInterestClaimPreview({ bank_balance: bank, unclaimed_interest: interest })).toEqual({
      currentBankBalanceWld: bank,
      accruedInterestWld: interest,
      hypotheticalBankBalanceWld: (BigInt(bank) + BigInt(interest)).toString(),
      isReadOnlyPreview: true,
    });
  });

  it.each([null, {}, {bank_balance: '-1', unclaimed_interest: '3'},
    {bank_balance: '100', unclaimed_interest: '1.5'},
    {bank_balance: Number.MAX_SAFE_INTEGER, unclaimed_interest: '1'},
    {bank_balance: '100', unclaimed_interest: null},
  ])('fails closed on invalid or unavailable standing: %j', (standing) => {
    expect(() => buildInterestClaimPreview(standing)).toThrow(ServiceUnavailableException);
  });

  it('uses only the authenticated actor and cannot trigger a claim', async () => {
    const repo = { getStanding: vi.fn().mockResolvedValue({ bank_balance: '9', unclaimed_interest: '2' }),
      claimCompoundInterest: vi.fn() } as unknown as BankRepository;
    const result = await new BankController(repo).previewInterestClaim(request);
    expect(result).toEqual({ currentBankBalanceWld: '9', accruedInterestWld: '2',
      hypotheticalBankBalanceWld: '11', isReadOnlyPreview: true });
    expect(repo.getStanding).toHaveBeenCalledExactlyOnceWith(actor);
    expect(repo.claimCompoundInterest).not.toHaveBeenCalled();
  });

  it('rejects missing repository rather than inventing zero balances', async () => {
    await expect(new BankController(null).previewInterestClaim(request)).rejects.toThrow(ServiceUnavailableException);
  });
});
