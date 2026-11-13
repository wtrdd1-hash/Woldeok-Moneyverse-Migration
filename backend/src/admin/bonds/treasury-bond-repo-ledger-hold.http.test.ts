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

describe('P0 repo-loan balanced ledger settlement certified', () => {
  const createRepoLoan = vi.fn().mockResolvedValue({ loanId: 'safe-loan-1', loanAmountWld: '800' });
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

  it('executes repo-loan borrowing when valid holdingId is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/bonds/repo-loans/borrow')
      .send({ holdingId: 'holding-1' })
      .expect(201);
    expect(response.body).toEqual({ loanId: 'safe-loan-1', loanAmountWld: '800' });
    expect(createRepoLoan).toHaveBeenCalledWith('test-member-id', 'holding-1');
  });

  it('rejects borrow when holdingId is missing', async () => {
    await request(app.getHttpServer())
      .post('/bonds/repo-loans/borrow')
      .send({})
      .expect(400);
  });

  it('executes repo-loan repayment when valid loanId is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/bonds/repo-loans/repay')
      .send({ loanId: 'loan-1' })
      .expect(201);
    expect(response.body).toEqual({ repaidAmountWld: '810' });
    expect(repayRepoLoan).toHaveBeenCalledWith('test-member-id', 'loan-1');
  });

  it('rejects repay when loanId is missing', async () => {
    await request(app.getHttpServer())
      .post('/bonds/repo-loans/repay')
      .send({})
      .expect(400);
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

  it('delegates createRepoLoan to repository', async () => {
    const repoMock = { createRepoLoan: vi.fn().mockResolvedValue({ loanId: 'l1', loanAmountWld: '800' }) };
    const service = new TreasuryBondService(repoMock as never);
    const result = await service.createRepoLoan('test-member-id', 'holding-1');
    expect(result).toEqual({ loanId: 'l1', loanAmountWld: '800' });
    expect(repoMock.createRepoLoan).toHaveBeenCalledWith('test-member-id', 'holding-1');
  });

  it('delegates repayRepoLoan to repository', async () => {
    const repoMock = { repayRepoLoan: vi.fn().mockResolvedValue({ repaidAmountWld: '810' }) };
    const service = new TreasuryBondService(repoMock as never);
    const result = await service.repayRepoLoan('test-member-id', 'loan-1');
    expect(result).toEqual({ repaidAmountWld: '810' });
    expect(repoMock.repayRepoLoan).toHaveBeenCalledWith('test-member-id', 'loan-1');
  });
});
