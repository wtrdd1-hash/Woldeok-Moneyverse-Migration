import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import type { Queryable } from '../core/db';
import { WalletController } from './wallet.controller';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const row = (status: string) => ({ loan_id: '22222222-2222-4222-8222-222222222222', principal_amount: '900719925474099312345', interest_amount: '0', outstanding_amount: '900719925474099312345', status, issued_at: new Date('2026-10-30T00:00:00Z'), repaid_at: null });

describe('member bank loan status filter', () => {
  it('filters inside the latest 20 owner-scoped SQL function result without direct table reads', async () => {
    const query = vi.fn(async () => ({ rows: [row('overdue')] }));
    const repo = new PostgresWalletRepository({ query } as unknown as Queryable);
    expect(await repo.loansForUser(ACTOR, 'overdue')).toHaveLength(1);
    const [sql, args] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('public.bank_my_loans($1)');
    expect(sql).toMatch(/WHERE\s+loan\.status\s*=\s*\$2/i);
    expect(sql).not.toContain('FROM public.virtual_bank_loans');
    expect(args).toEqual([ACTOR, 'overdue']);
  });

  it('rejects invalid and duplicated query values before any database access', async () => {
    const loans = vi.fn(async () => []);
    const controller = new WalletController({ loans } as unknown as WalletService);
    const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
    for (const value of [['active', 'repaid'], 'active&admin=true', '', 'unknown', 0, null]) {
      await expect(controller.loans(request, value as never)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(loans).not.toHaveBeenCalled();
    await controller.loans(request, 'active');
    expect(loans).toHaveBeenCalledWith(ACTOR, 'active');
  });

  it('rejects a mismatched status from a stale or forged repository and preserves exact WLD strings', async () => {
    const query = vi.fn(async () => ({ rows: [row('active')] }));
    const repo = new PostgresWalletRepository({ query } as unknown as Queryable);
    const service = new WalletService(repo);
    await expect(service.loans(ACTOR, 'overdue')).rejects.toThrow(/loan status/i);
    const result = await service.loans(ACTOR, 'active');
    expect(result[0]?.principalAmount).toBe('900719925474099312345');
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1]?.[1]).toEqual([ACTOR, 'active']);
  });
});
