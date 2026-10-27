import { BadRequestException, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { AdminBankOperationsController } from './operations.controller';
import type { OperationsRepository } from './operations.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';
const request = { session: { user_id: ACTOR } } as RequestWithSession;

function setup() {
  const overview = { deposit_amount: '12345678901234567890', outstanding_amount: '23' };
  const grades = [{ grade: 'A', credit_limit: '1000' }];
  const loans = [{ loan_id: '00000000-0000-4000-8000-000000000002', principal_amount: '23' }];
  const repository = {
    bankOverview: vi.fn().mockResolvedValue(overview),
    creditGrades: vi.fn().mockResolvedValue(grades),
    loanBook: vi.fn().mockResolvedValue(loans),
  };
  const controller = new AdminBankOperationsController(repository as unknown as OperationsRepository);
  return { controller, repository, overview, grades, loans };
}

describe('GET /api/v1/admin/bank authoritative evidence', () => {
  it('returns all three real read models and preserves large exact WLD strings', async () => {
    const { controller, repository, overview, grades, loans } = setup();
    await expect(controller.overview(request)).resolves.toEqual({ overview, grades, loans });
    expect(repository.bankOverview).toHaveBeenCalledWith(ACTOR);
    expect(repository.creditGrades).toHaveBeenCalledWith(ACTOR);
    expect(repository.loanBook).toHaveBeenCalledWith(ACTOR);
  });

  it.each([
    'bankOverview',
    'creditGrades',
    'loanBook',
  ] as const)('does not return HTTP-200-looking fabricated evidence if %s fails', async (method) => {
    const { controller, repository } = setup();
    repository[method].mockRejectedValueOnce(new Error('simulated bank database outage'));
    const error = await controller.overview(request).then(() => null, (cause: unknown) => cause);
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as Error).message).toBe('the bank console could not be read');
  });

  it('preserves explicit database role refusal as forbidden', async () => {
    const { controller, repository } = setup();
    repository.bankOverview.mockRejectedValueOnce(
      Object.assign(new Error('operator role required'), { code: '42501' }),
    );
    await expect(controller.overview(request)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('treats missing database table grants as an unavailable read, not a caller denial', async () => {
    const { controller, repository } = setup();
    repository.bankOverview.mockRejectedValueOnce(
      Object.assign(new Error('permission denied for table account_balances'), { code: '42501' }),
    );
    await expect(controller.overview(request)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('preserves malformed SQL input classification', async () => {
    const { controller, repository } = setup();
    repository.loanBook.mockRejectedValueOnce(
      Object.assign(new Error('invalid input syntax for type uuid'), { code: '22P02' }),
    );
    await expect(controller.overview(request)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('passes a validated loan-book limit to the repository', async () => {
    const { controller, repository } = setup();
    await controller.overview(request, '20');
    expect(repository.loanBook).toHaveBeenCalledWith(ACTOR, 20);
  });
});
