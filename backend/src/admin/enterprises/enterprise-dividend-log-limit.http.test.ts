import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { AdminEnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';

describe('Admin enterprise dividend logs HTTP boundary (isolated guard doubles)', () => {
  let app: INestApplication;
  const listRecentDividendLogs = vi.fn().mockResolvedValue([]);

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AdminEnterpriseController],
      providers: [{ provide: EnterpriseService, useValue: { listRecentDividendLogs } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminSessionGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('rejects malformed, repeated and excessive limit before service access', async () => {
    listRecentDividendLogs.mockClear();
    for (const query of [
      '?limit=2junk', '?limit=1e2', '?limit=1.5', '?limit=0', '?limit=-1',
      '?limit=101', '?limit=9007199254740992', '?limit=1&limit=2',
    ]) {
      await request(app.getHttpServer()).get('/admin/enterprises/dividend-logs' + query).expect(400);
    }
    expect(listRecentDividendLogs).not.toHaveBeenCalled();
  });

  it('preserves omitted/default and valid bounded history', async () => {
    listRecentDividendLogs.mockClear();
    await request(app.getHttpServer()).get('/admin/enterprises/dividend-logs').expect(200);
    await request(app.getHttpServer()).get('/admin/enterprises/dividend-logs?limit=1').expect(200);
    await request(app.getHttpServer()).get('/admin/enterprises/dividend-logs?limit=100').expect(200);
    expect(listRecentDividendLogs.mock.calls).toEqual([[20], [1], [100]]);
  });
});
