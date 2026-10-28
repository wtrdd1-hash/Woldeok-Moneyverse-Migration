import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CentralBankService } from './central-bank.service';
import { MintBureauService } from './mint-bureau.service';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';
import { MonetaryController } from './monetary.controller';

const methods = {
  getRecentEvents: vi.fn().mockResolvedValue([]),
  listPolicyOrders: vi.fn().mockResolvedValue([]),
  listMintCertificates: vi.fn().mockResolvedValue([]),
  listRetirementCertificates: vi.fn().mockResolvedValue([]),
};

const cases = [
  ['/admin/economy/monetary/auto-regulation/events', methods.getRecentEvents],
  ['/admin/economy/monetary/orders', methods.listPolicyOrders],
  ['/admin/economy/monetary/policy-orders', methods.listPolicyOrders],
  ['/admin/economy/monetary/certificates/mints', methods.listMintCertificates],
  ['/admin/economy/monetary/mint-certificates', methods.listMintCertificates],
  ['/admin/economy/monetary/certificates/retirements', methods.listRetirementCertificates],
] as const;

const malformed = [
  '?limit=', '?limit=%20', '?limit=0', '?limit=00', '?limit=01',
  '?limit=-1', '?limit=1e2', '?limit=0x10', '?limit=1.0',
  '?limit=51', '?limit=999999999999999999999999',
  '?limit=Infinity', '?limit=2&limit=3', '?limit=1%202',
];

describe('admin monetary listing limits HTTP boundary', () => {
  let app: INestApplication;
  let isAdmin = true;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [MonetaryController],
      providers: [
        { provide: CentralBankService, useValue: { listPolicyOrders: methods.listPolicyOrders } },
        { provide: MintBureauService, useValue: {
          listMintCertificates: methods.listMintCertificates,
          listRetirementCertificates: methods.listRetirementCertificates,
        } },
        { provide: AutoMonetaryRegulationService, useValue: { getRecentEvents: methods.getRecentEvents } },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => isAdmin })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    isAdmin = true;
    for (const method of new Set(Object.values(methods))) method.mockClear();
  });

  afterAll(async () => { await app?.close(); });

  for (const [path, method] of cases) {
    it(`${path}: preserves omitted default and accepts 1/50`, async () => {
      await request(app.getHttpServer()).get(path).expect(200);
      await request(app.getHttpServer()).get(`${path}?limit=1`).expect(200);
      await request(app.getHttpServer()).get(`${path}?limit=50`).expect(200);
      expect(method.mock.calls.map(([value]) => value)).toEqual([20, 1, 50]);
    });

    for (const suffix of malformed) {
      it(`${path}: rejects ${suffix} before service/DB access`, async () => {
        await request(app.getHttpServer()).get(`${path}${suffix}`).expect(400);
        expect(method).not.toHaveBeenCalled();
      });
    }

    it(`${path}: admin guard denies access before service/DB access`, async () => {
      isAdmin = false;
      await request(app.getHttpServer()).get(path).expect(403);
      expect(method).not.toHaveBeenCalled();
    });
  }
});
