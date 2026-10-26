import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { toBankStandingSnapshot } from './bank-standing-snapshot';
import { BankController } from './bank.controller';
import type { BankRepository } from './bank.repository';
import type { RequestWithSession } from '../auth/session.context';

const actor = '11111111-1111-4111-8111-111111111111';
const wide = '9'.repeat(38);
const valid = {
  cash_balance: wide,
  bank_balance: '200',
  unclaimed_interest: '0',
  active_loan: null,
};

const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('private virtual bank cash/deposit snapshot', () => {
  it('projects only owner-safe canonical WLD strings, not loan/bond/private source data', () => {
    expect(toBankStandingSnapshot(valid, new Date('2026-10-26T02:30:00.000Z'))).toEqual({
      scope: 'current_virtual_cash_deposit_only',
      source: 'bank_get_my_standing',
      generatedAt: '2026-10-26T02:30:00.000Z',
      cashBalanceWld: wide,
      depositBalanceWld: '200',
      unclaimedInterestEstimateWld: '0',
    });
  });

  it.each([
    null,
    [],
    {},
    { ...valid, cash_balance: 100 },
    { ...valid, cash_balance: '-1' },
    { ...valid, cash_balance: '01' },
    { ...valid, bank_balance: '9'.repeat(39) },
    { ...valid, unclaimed_interest: '1e4' },
  ])('fails closed on invalid DB standing %j', (data) => {
    expect(() => toBankStandingSnapshot(data, new Date())).toThrow(ServiceUnavailableException);
  });

  it('fetches the existing owner-scoped SQL standing using the authenticated session only', async () => {
    const getStanding = vi.fn().mockResolvedValue(valid);
    const controller = new BankController({ getStanding } as unknown as BankRepository);
    const result = await controller.standingSnapshot(request);
    expect(getStanding).toHaveBeenCalledExactlyOnceWith(actor);
    expect(result).toMatchObject({
      scope: 'current_virtual_cash_deposit_only',
      cashBalanceWld: wide,
    });
    expect(result).not.toHaveProperty('active_loan');
  });

  it('does not report a successful snapshot if the database is unavailable', async () => {
    const controller = new BankController({
      getStanding: vi.fn().mockRejectedValue(new Error('db down')),
    } as unknown as BankRepository);
    await expect(controller.standingSnapshot(request)).rejects.toThrow('db down');
  });
});
