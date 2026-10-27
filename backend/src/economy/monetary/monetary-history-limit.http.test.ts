import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { MonetaryController } from './monetary.controller';
import { CentralBankService } from './central-bank.service';
import { MintBureauService } from './mint-bureau.service';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';

const base = '/admin/economy/monetary';
const routes = [
  'auto-regulation/events',
  'orders',
  'policy-orders',
  'certificates/mints',
  'mint-certificates',
  'certificates/retirements',
];

describe('monetary admin history HTTP pagination contract (guard test doubles)', () => {
  let app: INestApplication;
  const getRecentEvents = vi.fn().mockResolvedValue([]);
  const listPolicyOrders = vi.fn().mockResolvedValue([]);
  const listMintCertificates = vi.fn().mockResolvedValue([]);
  const listRetirementCertificates = vi.fn().mockResolvedValue([]);

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [MonetaryController],
      providers: [
        { provide: CentralBankService, useValue: { listPolicyOrders } },
        { provide: MintBureauService, useValue: { listMintCertificates, listRetirementCertificates } },
        { provide: AutoMonetaryRegulationService, useValue: { getRecentEvents } },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('rejects malformed, oversized and duplicate query parameters for every route without querying services', async () => {
    for (const route of routes) {
      for (const query of ['?limit=2junk', '?limit=51', '?limit=1e2', '?limit=1&limit=2']) {
        await request(app.getHttpServer()).get(`${base}/${route}${query}`).expect(400);
      }
    }
    expect(getRecentEvents).not.toHaveBeenCalled();
    expect(listPolicyOrders).not.toHaveBeenCalled();
    expect(listMintCertificates).not.toHaveBeenCalled();
    expect(listRetirementCertificates).not.toHaveBeenCalled();
  });

  it('uses default 20 and allows 50 for every route', async () => {
    for (const route of routes) {
      await request(app.getHttpServer()).get(`${base}/${route}`).expect(200);
      await request(app.getHttpServer()).get(`${base}/${route}?limit=50`).expect(200);
    }
    for (const mock of [getRecentEvents, listPolicyOrders, listMintCertificates, listRetirementCertificates]) {
      expect(mock).toHaveBeenCalledWith(20);
      expect(mock).toHaveBeenCalledWith(50);
    }
  });
});
