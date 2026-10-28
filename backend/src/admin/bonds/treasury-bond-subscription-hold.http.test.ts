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
  requireUserId: () => 'test-user-id',
}));
import { PublicTreasuryBondController } from './treasury-bond.controller';
import { TreasuryBondService } from './treasury-bond.service';

describe('member bond subscription finance containment', () => {
  let app: INestApplication;
  const subscribeBond = vi.fn().mockResolvedValue({ holdingId: 'unexpected', totalPriceWld: '100' });
  const listUserHoldings = vi.fn().mockResolvedValue([]);
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [PublicTreasuryBondController],
      providers: [{ provide: TreasuryBondService, useValue: { subscribeBond, listUserHoldings } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('returns 503 before the service for normal, replayed and coercible financial orders', async () => {
    subscribeBond.mockClear();
    for (const units of [1, 1, '1e2', ' 1 ', 0, -1, 1.5]) {
      const response = await request(app.getHttpServer())
        .post('/bonds/subscribe')
        .send({ bondId: '3e9d3d2e-95ca-44c9-b013-b2cbfd4a8e39', units })
        .expect(503);
      expect(response.body.message).toMatch(/unavailable/i);
    }
    expect(subscribeBond).not.toHaveBeenCalled();
  });

  it('retains consent and CSRF guards for the held financial POST', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, PublicTreasuryBondController.prototype.subscribeBond) as unknown[];
    expect(guards).toContain(ConsentGuard);
    expect(guards).toContain(CsrfGuard);
  });

  it('preserves the member read-only holdings route', async () => {
    await request(app.getHttpServer()).get('/bonds/my-holdings').expect(200);
    expect(listUserHoldings).toHaveBeenCalled();
  });
});
