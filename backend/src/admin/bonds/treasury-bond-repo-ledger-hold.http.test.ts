import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';

vi.mock('../../auth/session.context', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../auth/session.context')>()),
  requireUserId: () => 'test-member-id',
}));

import { PublicTreasuryBondController } from './treasury-bond.controller';
import { TreasuryBondService } from './treasury-bond.service';
import { TreasuryBondRepository } from './treasury-bond.repository';

describe('P0 repo-loan unjournaled WLD containment', () => {
  const createRepoLoan = vi.fn().mockResolvedValue({ loanId: 'unsafe-loan', loanAmountWld: '800' });
  const repayRepoLoan = vi.fn().mockResolvedValue({ repaidAmountWld: '810' });
  const listUserRepoLoans = vi.fn().mockResolvedValue([]);
  let app: INestApplication;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [PublicTreasuryBondController],
      providers: [{ provide: TreasuryBondService, useValue: { createRepoLoan, repayRepoLoan, listUserRepoLoans } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['/bonds/repo-loans/borrow', { holdingId: 'holding-1' }],
    ['/bonds/repo-loans/borrow', {}],
    ['/bonds/repo-loans/borrow', { holdingId: 'holding-1', amount: '1e6' }],
    ['/bonds/repo-loans/repay', { loanId: 'loan-1' }],
    ['/bonds/repo-loans/repay', {}],
    ['/bonds/repo-loans/repay', { loanId: 'loan-1', retry: true }],
  ])('rejects %s before financial service execution', async (path, body) => {
    const response = await request(app.getHttpServer()).post(path).send(body).expect(503);
    expect(response.body.message).toMatch(/ledger|unavailable/i);
    expect(createRepoLoan).not.toHaveBeenCalled();
    expect(repayRepoLoan).not.toHaveBeenCalled();
  });

  it.each(['borrowRepoLoan', 'repayRepoLoan'] as const)('requires consent and CSRF for %s', (method) => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, PublicTreasuryBondController.prototype[method]) as unknown[];
    expect(guards).toContain(ConsentGuard);
    expect(guards).toContain(CsrfGuard);
  });

  it('keeps owner-scoped repo-loan history readable', async () => {
    await request(app.getHttpServer()).get('/bonds/my-repo-loans').expect(200, []);
    expect(listUserRepoLoans).toHaveBeenCalledWith('test-member-id');
  });

  it.each(['createRepoLoan', 'repayRepoLoan'] as const)('rejects internal service %s without repository access', async (method) => {
    const repository = { createRepoLoan: vi.fn(), repayRepoLoan: vi.fn() };
    const service = new TreasuryBondService(repository as never);
    await expect(service[method]('test-member-id', 'record-1')).rejects.toMatchObject({ status: 503 });
    expect(repository.createRepoLoan).not.toHaveBeenCalled();
    expect(repository.repayRepoLoan).not.toHaveBeenCalled();
  });

  it.each(['createRepoLoan', 'repayRepoLoan'] as const)('rejects repository %s before SQL', async (method) => {
    const pool = { connect: vi.fn(), query: vi.fn() };
    const repository = new TreasuryBondRepository(pool as never);
    await expect(repository[method]('test-member-id', 'record-1')).rejects.toMatchObject({ status: 503 });
    expect(pool.connect).not.toHaveBeenCalled();
    expect(pool.query).not.toHaveBeenCalled();
  });
});
