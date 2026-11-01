import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException, type INestApplication, type ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AdminTreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';
import { AutoSovereignWealthFundService } from './auto-swf.service';
import { SessionRepository } from '../../auth/session.repository';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';

const protectedMethods = [
  'injectFunds', 'absorbFunds', 'disburseDividend', 'disburseTargetedSubsidy',
  'userDonate', 'disburseGrant', 'distributeBudget', 'buybackBurn',
  'executeWealthTax', 'createBackupSnapshot', 'triggerSwfRebalance',
  'liquidateSwfToTreasury', 'updateSwfConfig',
] as const;

describe('v744 treasury administrative write boundary', () => {
  it.each(protectedMethods)('%s requires a console session and session-bound CSRF', (method) => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AdminTreasuryController.prototype[method]) as unknown[] | undefined;
    expect(guards).toContain(AdminSessionGuard);
    expect(guards).toContain(CsrfGuard);
  });

  let app: INestApplication;
  const verifyCsrf = vi.fn();
  const touchAdminSession = vi.fn();
  const createBackupSnapshot = vi.fn();
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AdminTreasuryController],
      providers: [
        { provide: TreasuryService, useValue: { createBackupSnapshot } },
        { provide: AutoSovereignWealthFundService, useValue: {} },
        { provide: SessionRepository, useValue: { verifyCsrf, touchAdminSession } },
        AdminSessionGuard, CsrfGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().session = {
            id: 'session-test', user_id: '00000000-0000-0000-0000-000000000001',
          };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => {
    vi.clearAllMocks();
    verifyCsrf.mockResolvedValue(true);
    touchAdminSession.mockResolvedValue({ state: 'open' });
    createBackupSnapshot.mockRejectedValue(new ServiceUnavailableException({ code: 'TREASURY_BACKUP_EVIDENCE_UNAVAILABLE' }));
  });

  it('refuses a missing CSRF token before backup snapshot dispatch', async () => {
    await request(app.getHttpServer()).post('/admin/treasury/backup/snapshot').send({}).expect(403);
    expect(createBackupSnapshot).not.toHaveBeenCalled();
    expect(verifyCsrf).not.toHaveBeenCalled();
  });
  it('refuses a rejected CSRF token before backup snapshot dispatch', async () => {
    verifyCsrf.mockResolvedValue(false);
    await request(app.getHttpServer()).post('/admin/treasury/backup/snapshot')
      .set('x-csrf-token', 'rejected').send({}).expect(403);
    expect(createBackupSnapshot).not.toHaveBeenCalled();
  });
  it('refuses a missing administrator console session before CSRF check', async () => {
    touchAdminSession.mockResolvedValue({ state: 'missing' });
    await request(app.getHttpServer()).post('/admin/treasury/backup/snapshot')
      .set('x-csrf-token', 'valid').send({}).expect(403);
    expect(verifyCsrf).not.toHaveBeenCalled();
    expect(createBackupSnapshot).not.toHaveBeenCalled();
  });
  it('preserves the existing 503 finance hold after both checks pass', async () => {
    const response = await request(app.getHttpServer()).post('/admin/treasury/backup/snapshot')
      .set('x-csrf-token', 'valid').send({}).expect(503);
    expect(response.body).toMatchObject({ code: 'TREASURY_BACKUP_EVIDENCE_UNAVAILABLE' });
    expect(touchAdminSession).toHaveBeenCalledWith('session-test', '00000000-0000-0000-0000-000000000001');
    expect(verifyCsrf).toHaveBeenCalledWith('session-test', 'valid');
    expect(createBackupSnapshot).toHaveBeenCalledOnce();
  });
});
