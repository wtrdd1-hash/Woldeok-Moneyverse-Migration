import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { AdminTreasuryBondController } from './treasury-bond.controller';
import { TreasuryBondService } from './treasury-bond.service';

describe('admin bond coupon logs HTTP query boundary', () => {
  let app: INestApplication;
  const listRecentCouponLogs = vi.fn().mockResolvedValue([]);
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AdminTreasuryBondController],
      providers: [{ provide: TreasuryBondService, useValue: { listRecentCouponLogs } }],
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

  it('returns 400 for malformed, duplicated, and oversized limits without reading records', async () => {
    listRecentCouponLogs.mockClear();
    for (const suffix of ['?limit=', '?limit=0', '?limit=-1', '?limit=101', '?limit=2junk', '?limit=1e2', '?limit=1.5', '?limit=1&limit=2']) {
      await request(app.getHttpServer()).get('/admin/bonds/coupon-logs' + suffix).expect(400);
    }
    expect(listRecentCouponLogs).not.toHaveBeenCalled();
  });

  it('accepts default 20 and bounded 100', async () => {
    listRecentCouponLogs.mockClear();
    await request(app.getHttpServer()).get('/admin/bonds/coupon-logs').expect(200);
    await request(app.getHttpServer()).get('/admin/bonds/coupon-logs?limit=100').expect(200);
    expect(listRecentCouponLogs.mock.calls).toEqual([[20], [100]]);
  });
});
