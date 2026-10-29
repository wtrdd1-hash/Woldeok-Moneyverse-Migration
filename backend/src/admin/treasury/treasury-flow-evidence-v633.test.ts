import { describe, expect, it, vi } from 'vitest';
import { HEADERS_METADATA } from '@nestjs/common/constants';
import { TreasuryRepository } from './treasury.repository';
import { AdminTreasuryController } from './treasury.controller';
import type { Queryable } from '../../core/db';

function repository(query: (sql: string) => Promise<{ rows: unknown[] }>) {
  return new TreasuryRepository({ query: vi.fn(query) } as unknown as Queryable);
}

describe('P1 treasury revenue and expenditure ledger evidence', () => {
  it.each([
    ['getRevenue', 'TREASURY_REVENUE_EVIDENCE_UNAVAILABLE'],
    ['getExpenditure', 'TREASURY_EXPENDITURE_EVIDENCE_UNAVAILABLE'],
  ] as const)('%s refuses to turn a failed ledger read into verified zero WLD', async (method, code) => {
    const repo = repository(async () => { throw Object.assign(new Error('permission denied'), { code: '42501' }); });
    await expect(repo[method]()).rejects.toMatchObject({
      status: 503,
      response: { code },
    });
  });

  it.each(['getRevenue', 'getExpenditure'] as const)('%s preserves legitimate zero when an empty ledger read succeeds', async (method) => {
    const repo = repository(async () => ({ rows: [] }));
    const result = await repo[method]();
    expect(result).toMatchObject({ total_24h_wld: '0', total_7d_wld: '0', total_30d_wld: '0' });
    expect(result.items.length).toBeGreaterThan(0);
  });

  it.each(['getRevenue', 'getExpenditure'] as const)('%s has an explicit no-store HTTP contract', (method) => {
    const headers = Reflect.getMetadata(HEADERS_METADATA, AdminTreasuryController.prototype[method]) as
      | { name: string; value: string }[]
      | undefined;
    expect(headers).toEqual(expect.arrayContaining([{ name: 'Cache-Control', value: 'no-store' }]));
  });
});

import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll } from 'vitest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { TreasuryService } from './treasury.service';
import { AutoSovereignWealthFundService } from './auto-swf.service';

describe('P1 treasury flow real NestJS HTTP contract', () => {
  let app: INestApplication;
  const query = vi.fn();
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AdminTreasuryController],
      providers: [
        { provide: TreasuryRepository, useValue: repository(query) },
        TreasuryService,
        { provide: AutoSovereignWealthFundService, useValue: {} },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['revenue', 'TREASURY_REVENUE_EVIDENCE_UNAVAILABLE'],
    ['expenditure', 'TREASURY_EXPENDITURE_EVIDENCE_UNAVAILABLE'],
  ])('GET /admin/treasury/%s returns private-error-safe 503 and no-store', async (route, code) => {
    query.mockReset().mockRejectedValue(Object.assign(new Error('private database detail'), { code: '42501' }));
    const response = await request(app.getHttpServer()).get(`/admin/treasury/${route}`).expect(503);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.code).toBe(code);
    expect(JSON.stringify(response.body)).not.toContain('private database detail');
  });

  it.each(['revenue', 'expenditure'])('GET /admin/treasury/%s preserves legitimate empty-ledger HTTP 200', async (route) => {
    query.mockReset().mockResolvedValue({ rows: [] });
    const response = await request(app.getHttpServer()).get(`/admin/treasury/${route}`).expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.total_30d_wld).toBe('0');
  });
});
