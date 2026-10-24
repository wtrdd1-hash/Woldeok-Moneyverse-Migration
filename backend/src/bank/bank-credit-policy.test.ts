import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { BankController } from './bank.controller';
import { GUARDS_METADATA, HEADERS_METADATA } from '@nestjs/common/constants';
import { BankRepository } from './bank.repository';
import { BankPolicyUnavailableError, projectCreditPolicy } from './credit-policy';

const actor = '77a071a6-a75e-4bcb-ac7e-10ae50aa86ef';
const verified = {
  credit_grade: 'B',
  credit_limit: '900719925474099312345678901234567890',
  loan_interest_bps: 850,
  loan_term_days: 30,
  loan_minimum_repayment: '100000000000000000000000000000000',
  active_loan: null,
};

describe('verified game credit policy (owner-only DB authority)', () => {
  it('preserves huge WLD integer strings and never invents a score or approval', () => {
    expect(projectCreditPolicy(verified)).toEqual({
      creditGrade: 'B',
      creditLimitWld: verified.credit_limit,
      interestRateBps: 850,
      termDays: 30,
      minimumRepaymentWld: verified.loan_minimum_repayment,
      activeLoanOutstandingWld: null,
      activeLoanStatus: null,
      hasActiveLoan: false,
      canRequestNewLoan: true,
      source: 'BANK_STANDING',
    });
    expect('score' in projectCreditPolicy(verified)).toBe(false);
  });

  it('suppresses eligibility when a real active or overdue loan exists', () => {
    const result = projectCreditPolicy({
      ...verified,
      active_loan: { status: 'overdue', outstanding_amount: '999999999999999999999' },
    });
    expect(result.hasActiveLoan).toBe(true);
    expect(result.canRequestNewLoan).toBe(false);
    expect(result.activeLoanStatus).toBe('overdue');
    expect(result.activeLoanOutstandingWld).toBe('999999999999999999999');
  });

  it('rejects missing, malformed, negative or imprecise policy evidence', () => {
    for (const bad of [null, {}, { ...verified, credit_limit: 10 }, { ...verified, credit_limit: '1.5' },
      { ...verified, credit_limit: '-1' }, { ...verified, loan_interest_bps: Infinity },
      { ...verified, active_loan: { status: 'active', outstanding_amount: null } }]) {
      expect(() => projectCreditPolicy(bad)).toThrow();
    }
    expect(projectCreditPolicy({ ...verified, credit_limit: '0' }).canRequestNewLoan).toBe(false);
  });

  it('queries only the existing actor-scoped SECURITY DEFINER bank standing function', async () => {
    const calls: { sql: string; params: readonly unknown[] | undefined }[] = [];
    const db: Queryable = {
      async query<R extends Record<string, unknown>>(sql: string, params?: readonly unknown[]) {
        calls.push({ sql, params });
        return { rows: [{ standing: verified } as unknown as R] };
      },
    };
    expect(await new BankRepository(db).getCreditPolicy(actor)).toMatchObject({ creditGrade: 'B' });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.sql).toContain('public.bank_get_my_standing($1)');
    expect(calls[0]?.params).toEqual([actor]);
    expect(calls[0]?.sql).not.toMatch(/FROM\s+public\.(users|virtual_bank_loans|user_job_progress)/i);
  });

  it('maps corrupt bank policy to a fail-closed 503 instead of fabricated values', async () => {
    const controller = new BankController({ getCreditPolicy: vi.fn().mockRejectedValue(new BankPolicyUnavailableError()) } as unknown as BankRepository);
    const request = { session: { user_id: actor } } as unknown as RequestWithSession;
    await expect(controller.creditPolicy(request)).rejects.toMatchObject({ status: 503 });
  });

  it('retains the authentication and consent guards and private no-store response metadata', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, BankController) as Array<{ name: string }>;
    expect(guards.map((guard) => guard.name)).toEqual(['SessionGuard', 'AuthenticatedGuard', 'ConsentGuard']);
    const headers = Reflect.getMetadata(HEADERS_METADATA, BankController.prototype.creditPolicy) as Array<{ name: string; value: string }>;
    expect(headers).toContainEqual({ name: 'Cache-Control', value: 'private, no-store' });
  });

  it('takes actor from the guarded session, never from a request parameter', async () => {
    const getCreditPolicy = vi.fn().mockResolvedValue(projectCreditPolicy(verified));
    const controller = new BankController({ getCreditPolicy } as unknown as BankRepository);
    const request = { session: { user_id: actor } } as unknown as RequestWithSession;
    expect(await controller.creditPolicy(request)).toMatchObject({ creditGrade: 'B' });
    expect(getCreditPolicy).toHaveBeenCalledExactlyOnceWith(actor);
  });
});
