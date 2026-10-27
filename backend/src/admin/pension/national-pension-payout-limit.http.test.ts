import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { AdminNationalPensionController } from './national-pension.controller';
import { NationalPensionService } from './national-pension.service';

describe('Admin pension payout history HTTP boundary', () => {
  let app: INestApplication;
  const listRecentPayoutLogs = vi.fn().mockResolvedValue([]);
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AdminNationalPensionController],
      providers: [{ provide: NationalPensionService, useValue: { listRecentPayoutLogs } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminSessionGuard).useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('rejects malformed, duplicate and out-of-range payout history limits before service access', async () => {
    listRecentPayoutLogs.mockClear();
    for (const query of ['?limit=2junk', '?limit=1e2', '?limit=0', '?limit=101', '?limit=1&limit=2']) {
      await request(app.getHttpServer()).get('/admin/pension/recent-payouts' + query).expect(400);
    }
    expect(listRecentPayoutLogs).not.toHaveBeenCalled();
  });

  it('preserves default and valid bounded financial history queries', async () => {
    listRecentPayoutLogs.mockClear();
    await request(app.getHttpServer()).get('/admin/pension/recent-payouts').expect(200);
    await request(app.getHttpServer()).get('/admin/pension/recent-payouts?limit=100').expect(200);
    expect(listRecentPayoutLogs.mock.calls).toEqual([[20], [100]]);
  });
});
