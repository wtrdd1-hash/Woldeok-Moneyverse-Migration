import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import type { RequestWithSession } from '../auth/session.context';
import { BankController } from './bank.controller';
import type { BankRepository } from './bank.repository';

const actor = '77a071a6-a75e-4bcb-ac7e-10ae50aa86ef';
const loanId = '2ea069a0-a581-4a7f-b3a9-18f4141745c3';
const request = {session: {user_id: actor}} as unknown as RequestWithSession;

describe('authenticated owner loan maturity endpoint', () => {
  it('reads standing for session actor and returns a non-transactional deadline', async () => {
    const getStanding = vi.fn(async (userId: string) => {
      expect(userId).toBe(actor);
      return {
        cash_balance: '100',
        active_loan: {loan_id: loanId, outstanding_amount: '75', minimum_repayment: '25',
          status: 'active', maturity_at: '2026-12-01T00:00:00Z'},
      };
    });
    const controller = new BankController({getStanding} as unknown as BankRepository);
    const result = await controller.loanDeadline(request);
    expect(result).toMatchObject({hasActiveLoan: true, loanId, cashBalance: '100', minimumRepayment: '25', quoteOnly: true});
    expect(getStanding).toHaveBeenCalledOnce();
  });
  it('fails closed on unavailable standing', async () => {
    const controller = new BankController({getStanding: async () => null} as unknown as BankRepository);
    await expect(controller.loanDeadline(request)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
  it('requires a bound authenticated session rather than accepting a user ID', async () => {
    const getStanding = vi.fn();
    const controller = new BankController({getStanding} as unknown as BankRepository);
    await expect(controller.loanDeadline({} as RequestWithSession)).rejects.toThrow('guard order defect');
    expect(getStanding).not.toHaveBeenCalled();
  });
});
