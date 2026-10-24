import { describe, expect, it, vi } from 'vitest';
import { BankController } from './bank.controller';
import type { BankRepository } from './bank.repository';
import type { RequestWithSession } from '../auth/session.context';

const actor = '77a071a6-a75e-4bcb-ac7e-10ae50aa86ef';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const standing = { credit_limit: '500000', loan_interest_bps: 450, loan_term_days: 30, active_loan: null };

describe('authenticated new-loan quote endpoint', () => {
  it('reads the session actor only and never issues a financial write', async () => {
    const getStanding = vi.fn(async () => standing);
    const controller = new BankController({ getStanding } as unknown as BankRepository);
    await expect(controller.borrowQuote(request, '101')).resolves.toMatchObject({ eligible: true, totalDueWld: '106', binding: false });
    expect(getStanding).toHaveBeenCalledExactlyOnceWith(actor);
  });
  it('refuses an absent session and unavailable standing', async () => {
    const getStanding = vi.fn(async () => null);
    const controller = new BankController({ getStanding } as unknown as BankRepository);
    await expect(controller.borrowQuote({} as RequestWithSession, '100')).rejects.toThrow('no session');
    await expect(controller.borrowQuote(request, '100')).rejects.toMatchObject({ status: 503 });
  });
  it('fails closed with HTTP 503 if authoritative lending policy is incomplete', async () => {
    const controller = new BankController({ getStanding: async () => ({ ...standing, loan_interest_bps: null }) } as unknown as BankRepository);
    await expect(controller.borrowQuote(request, '100')).rejects.toMatchObject({ status: 503 });
  });
  it('rejects malformed and over-limit amounts with HTTP 400', async () => {
    const controller = new BankController({ getStanding: async () => standing } as unknown as BankRepository);
    await expect(controller.borrowQuote(request, '1e6')).rejects.toMatchObject({ status: 400 });
    await expect(controller.borrowQuote(request, '500001')).rejects.toMatchObject({ status: 400 });
  });
});
