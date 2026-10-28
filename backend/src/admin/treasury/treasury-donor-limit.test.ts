import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { BadRequestException, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Queryable } from '../../core/db';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminTreasuryController } from './treasury.controller';
import { TreasuryRepository } from './treasury.repository';
import { TreasuryService } from './treasury.service';
import { AutoSovereignWealthFundService } from './auto-swf.service';

const malformed: unknown[] = ['', '2junk', '1e2', '2.5', '-1', '+2', ' 2', '02',
  '9999999999999999999999', 'Infinity', ['1', '2'], { limit: '2' }];

describe('P1 treasury donor ranking strict paging contract', () => {
  const getTopDonors = vi.fn().mockResolvedValue([]);
  const controller = new AdminTreasuryController({ getTopDonors } as unknown as TreasuryService);

  for (const value of malformed) {
    it(`rejects malformed limit ${JSON.stringify(value)} before service query`, async () => {
      getTopDonors.mockClear();
      await expect(controller.getTopDonors(value as string)).rejects.toThrow(BadRequestException);
      expect(getTopDonors).not.toHaveBeenCalled();
    });
  }
  it('rejects zero and upper-bound overflow', async () => {
    getTopDonors.mockClear();
    await expect(controller.getTopDonors('0')).rejects.toThrow(BadRequestException);
    await expect(controller.getTopDonors('101')).rejects.toThrow(BadRequestException);
    expect(getTopDonors).not.toHaveBeenCalled();
  });
  it('preserves default and canonical valid bounds', async () => {
    await controller.getTopDonors();
    expect(getTopDonors).toHaveBeenLastCalledWith(10);
    await controller.getTopDonors('100');
    expect(getTopDonors).toHaveBeenLastCalledWith(100);
  });
});

describe('P1 treasury donor ranking direct-call bounds', () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const repository = new TreasuryRepository({ query } as unknown as Queryable);
  const service = new TreasuryService(repository);
  for (const value of [NaN, Infinity, -Infinity, -1, 0, 1.5, 101, 1e20]) {
    it(`rejects repository limit ${String(value)} before SQL`, async () => {
      query.mockClear();
      await expect(repository.getTopDonors(value)).rejects.toThrow(BadRequestException);
      expect(query).not.toHaveBeenCalled();
    });
    it(`rejects service limit ${String(value)} before repository`, async () => {
      query.mockClear();
      await expect(service.getTopDonors(value)).rejects.toThrow(BadRequestException);
      expect(query).not.toHaveBeenCalled();
    });
  }
  it('binds limit and stable donor ranking order', async () => {
    query.mockClear();
    await repository.getTopDonors(100);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('LIMIT $1'), [100]);
    expect(query.mock.calls.at(-1)?.[0]).toMatch(/ORDER BY sum\(d\.amount_wld\) DESC, u\.id ASC/);
  });
});

describe('P1 treasury donor ranking HTTP boundary', () => {
  let app: INestApplication;
  const getTopDonors = vi.fn().mockResolvedValue([]);
  const evaluateAndRebalance = vi.fn();
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AdminTreasuryController],
      providers: [
        { provide: TreasuryService, useValue: { getTopDonors } },
        { provide: AutoSovereignWealthFundService, useValue: { evaluateAndRebalance } },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('returns HTTP 503 on SWF rebalance without calling settlement service', async () => {
    evaluateAndRebalance.mockClear();
    await request(app.getHttpServer()).post('/admin/treasury/swf/rebalance').send({}).expect(503);
    expect(evaluateAndRebalance).not.toHaveBeenCalled();
  });

  it('returns HTTP 400 for malformed and duplicate query without service call', async () => {
    getTopDonors.mockClear();
    for (const suffix of ['?limit=2junk', '?limit=1e2', '?limit=0', '?limit=101',
      '?limit=1&limit=2', '?limit=9999999999999999999999']) {
      await request(app.getHttpServer()).get('/admin/treasury/donations/top' + suffix).expect(400);
    }
    expect(getTopDonors).not.toHaveBeenCalled();
  });
  it('returns normal shape for valid default and upper bound', async () => {
    await request(app.getHttpServer()).get('/admin/treasury/donations/top').expect(200, []);
    expect(getTopDonors).toHaveBeenLastCalledWith(10);
    await request(app.getHttpServer()).get('/admin/treasury/donations/top?limit=100').expect(200, []);
    expect(getTopDonors).toHaveBeenLastCalledWith(100);
  });
});
