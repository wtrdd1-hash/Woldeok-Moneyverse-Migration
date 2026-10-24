import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { BankController } from './bank.controller';
import type { BankRepository } from './bank.repository';
import type { RequestWithSession } from '../auth/session.context';

const actor = 'a0000000-0000-4000-8000-000000000001';
const loanId = 'b0000000-0000-4000-8000-000000000002';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('BankController.repaymentPreview', () => {
  it('uses authenticated session actor and returns no transaction id', async () => {
    const getStanding = vi.fn().mockResolvedValue({
      cash_balance: '200', active_loan: { loan_id: loanId, status: 'overdue', outstanding_amount: '120' },
    });
    const controller = new BankController({ getStanding } as unknown as BankRepository);
    const result = await controller.repaymentPreview(request, '150');
    expect(getStanding).toHaveBeenCalledExactlyOnceWith(actor);
    expect(result).toMatchObject({ effectiveAmount: '120', remainingCash: '80', canRepay: true });
    expect(result).not.toHaveProperty('transactionId');
  });

  it('rejects invalid amount without exposing owner standing', async () => {
    const getStanding = vi.fn().mockResolvedValue({ cash_balance: '200' });
    const controller = new BankController({ getStanding } as unknown as BankRepository);
    await expect(controller.repaymentPreview(request, '-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(getStanding).not.toHaveBeenCalled();
  });

  it('returns conflict for no active loan', async () => {
    const controller = new BankController({ getStanding: vi.fn().mockResolvedValue({
      cash_balance: '200', active_loan: null,
    }) } as unknown as BankRepository);
    await expect(controller.repaymentPreview(request, '1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('fails closed on unavailable standing', async () => {
    const controller = new BankController({ getStanding: vi.fn().mockResolvedValue(null) } as unknown as BankRepository);
    await expect(controller.repaymentPreview(request, '1')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
