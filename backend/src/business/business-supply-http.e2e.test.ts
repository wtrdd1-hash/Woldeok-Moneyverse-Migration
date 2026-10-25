import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';

const OWNERSHIP = '22222222-2222-4222-8222-222222222222';

describe('business supply-chain HTTP regression (isolated Nest app, no DB writes)', () => {
  let app: INestApplication;
  const service = { procureMaterials: vi.fn(), upgradeStorage: vi.fn() };

  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const testingModule = await Test.createTestingModule({
      controllers: [BusinessController],
      providers: [{ provide: BusinessService, useValue: service }],
    })
      .overrideGuard(SessionGuard).useValue(allow)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(allow)
      .overrideGuard(CsrfGuard).useValue(allow)
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('returns 503 without calling the procurement service or creating a fake receipt', async () => {
    const response = await request(app.getHttpServer()).post(`/businesses/${OWNERSHIP}/procure`)
      .send({ materialCode: 'RAW_PACKAGED', quantity: 10, idempotencyKey: '33333333-3333-4333-8333-333333333333' });
    expect(response.status).toBe(503);
    expect(service.procureMaterials).not.toHaveBeenCalled();
  });

  it('returns 503 without calling storage upgrade', async () => {
    const response = await request(app.getHttpServer()).post(`/businesses/${OWNERSHIP}/storage/upgrade`)
      .send({ idempotencyKey: '33333333-3333-4333-8333-333333333333' });
    expect(response.status).toBe(503);
    expect(service.upgradeStorage).not.toHaveBeenCalled();
  });
});
