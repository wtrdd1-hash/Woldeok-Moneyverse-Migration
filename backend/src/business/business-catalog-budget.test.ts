import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Queryable } from '../core/db';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { PostgresBusinessRepository } from './business.repository';

const actor = '11111111-1111-4111-8111-111111111111';
const catalog = [{ id: '22222222-2222-4222-8222-222222222222', purchaseCost: '9007199254740993' }];

describe('business catalogue maximum WLD budget', () => {
  const service = { catalog: vi.fn(async () => catalog), mineV2: vi.fn(async () => []) };
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BusinessController],
      providers: [{ provide: BusinessService, useValue: service }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: actor };
      next();
    });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('passes exact 64-bit-safe budget strings to the source on web and Android aliases', async () => {
    service.catalog.mockClear();
    await request(app.getHttpServer()).get('/business-types?maxCost=9007199254740993').expect(200);
    await request(app.getHttpServer()).get('/businesses/catalog?maxCost=9007199254740993').expect(200);
    expect(service.catalog).toHaveBeenCalledTimes(2);
    expect(service.catalog).toHaveBeenNthCalledWith(1, '9007199254740993');
    expect(service.catalog).toHaveBeenNthCalledWith(2, '9007199254740993');
  });

  it.each(['', '01', '-1', '1.1', '1e3', '1'.repeat(19), '0&maxCost=1'])(
    'refuses invalid or duplicate maxCost %s before touching the source', async (value) => {
      service.catalog.mockClear();
      await request(app.getHttpServer()).get(`/business-types?maxCost=${value}`).expect(400);
      expect(service.catalog).not.toHaveBeenCalled();
    },
  );

  it('preserves unfiltered catalogue compatibility', async () => {
    service.catalog.mockClear();
    await request(app.getHttpServer()).get('/business-types').expect(200);
    expect(service.catalog).toHaveBeenCalledWith(undefined);
  });

  it('uses parameterized bigint comparison on the existing read-only security-definer catalogue', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresBusinessRepository({ query } as unknown as Queryable);
    await repo.catalog('9007199254740993');
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]![0]).toContain('FROM public.business_catalog()');
    expect(query.mock.calls[0]![0]).toMatch(/purchase_cost\s*<=\s*\$1::bigint/);
    expect(query.mock.calls[0]![0]).toContain('ORDER BY catalog.purchase_cost, catalog.symbol');
    expect(query.mock.calls[0]![1]).toEqual(['9007199254740993']);
  });
});
