import 'reflect-metadata';
import { GUARDS_METADATA, HEADERS_METADATA } from '@nestjs/common/constants';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { BankController } from './bank.controller';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { BankRepayPreviewDto } from './bank.dto';
import { BankInputError, BankRepository } from './bank.repository';

const actor = '77a071a6-a75e-4bcb-ac7e-10ae50aa86ef';
const loanId = 'a0000000-0000-4000-8000-000000000001';
const foreignLoanId = 'b0000000-0000-4000-8000-000000000002';

function database(cash: string, debt: string, status = 'active') {
  const seen: Array<{ sql: string; values: readonly unknown[] | undefined }> = [];
  const db: Queryable = {
    async query<R extends Record<string, unknown>>(sql: string, values?: readonly unknown[]) {
      seen.push({ sql, values });
      return { rows: [{ standing: { cash_balance: cash, active_loan: { loan_id: loanId, outstanding_amount: debt, status } } } as unknown as R] };
    },
  };
  return { seen, repository: new BankRepository(db) };
}

describe('read-only member loan repayment impact preview', () => {
  it('uses one actor-scoped SECURITY DEFINER standing read and preserves exact huge integers', async () => {
    const { repository, seen } = database('900719925474099312345678', '900719925474099312345677');
    const result = await repository.previewRepayment(actor, loanId, '900719925474099312345679');
    expect(result).toMatchObject({
      loanId, requestedAmount: '900719925474099312345679',
      payableAmount: '900719925474099312345677',
      cashBefore: '900719925474099312345678', cashAfter: '1',
      debtBefore: '900719925474099312345677', debtAfter: '0',
      adjustmentAmount: '2', eligible: true, reason: 'ready', nonbinding: true,
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.sql).toContain('public.bank_get_my_standing($1)');
    expect(seen[0]?.sql).not.toMatch(/FROM\s+public\.(accounts|virtual_bank_loans)/i);
    expect(seen[0]?.values).toEqual([actor]);
  });

  it('does not disclose standing or amounts for a foreign or missing loan', async () => {
    const { repository } = database('1000', '2000');
    await expect(repository.previewRepayment(actor, foreignLoanId, '100')).rejects.toThrow(BankInputError);
  });

  it('returns an ineligible nonbinding estimate without negative cash or DB writes', async () => {
    const { repository } = database('5', '100');
    expect(await repository.previewRepayment(actor, loanId, '20')).toMatchObject({
      payableAmount: '20', cashAfter: null, debtAfter: '80', eligible: false,
      reason: 'insufficient_cash', nonbinding: true,
    });
  });

  it('rejects unsafe amount types and inactive loans', async () => {
    const { repository } = database('100', '100', 'repaid');
    await expect(repository.previewRepayment(actor, loanId, '1')).rejects.toThrow(BankInputError);
    await expect(repository.previewRepayment(actor, loanId, 9007199254740992)).rejects.toThrow(BankInputError);
    await expect(repository.previewRepayment(actor, loanId, '0')).rejects.toThrow(BankInputError);
    await expect(repository.previewRepayment(actor, loanId, '1e3')).rejects.toThrow(BankInputError);
  });

  it('requires a UUID and an exact positive integer string in the API DTO', async () => {
    expect(await validate(plainToInstance(BankRepayPreviewDto, { loanId, amount: '900719925474099312345678' }))).toHaveLength(0);
    expect((await validate(plainToInstance(BankRepayPreviewDto, { loanId, amount: 9007199254740992 }))).length).toBeGreaterThan(0);
    expect((await validate(plainToInstance(BankRepayPreviewDto, { loanId: 'bad', amount: '5' }))).length).toBeGreaterThan(0);
  });

  it('marks the private preview response as no-store', () => {
    const headers = Reflect.getMetadata(HEADERS_METADATA, BankController.prototype.repayPreview) as
      | Array<{ name: string; value: string }> | undefined;
    expect(headers).toContainEqual({ name: 'Cache-Control', value: 'private, no-store' });
    const guards = Reflect.getMetadata(GUARDS_METADATA, BankController.prototype.repayPreview) as unknown[];
    expect(guards).toContain(CsrfGuard);
  });
});
