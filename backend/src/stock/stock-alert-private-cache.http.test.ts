import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { StockAlertController } from './stock-alert.controller';
import { StockAlertRepository } from './stock-alert.repository';

const OWNER = '00000000-0000-4000-8000-000000000001';
const STOCK = '00000000-0000-4000-8000-000000000002';
const ALERT = '00000000-0000-4000-8000-000000000003';

function expectPrivate(response: request.Response) {
  expect(response.headers['cache-control']).toBe('private, no-store');
  expect(response.headers['x-robots-tag']).toBe('noindex');
}

describe('owner stock alert HTTP privacy headers', () => {
  let app: INestApplication;
  const repo = {
    list: vi.fn().mockResolvedValue([]),
    events: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: ALERT }),
    remove: vi.fn().mockResolvedValue({ deleted: true }),
  };
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [StockAlertController],
      providers: [{ provide: StockAlertRepository, useValue: repo }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (ctx: ExecutionContext) => {
        ctx.switchToHttp().getRequest().session = { user_id: OWNER };
        return true;
      } })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('prevents shared caching and indexing of owner alert definitions', async () => {
    const response = await request(app.getHttpServer()).get('/stocks/alerts').expect(200);
    expectPrivate(response);
    expect(repo.list).toHaveBeenCalledWith(OWNER, 'all');
  });
  it('prevents shared caching and indexing of owner alert event history', async () => {
    const response = await request(app.getHttpServer()).get('/stocks/alerts/events?limit=20').expect(200);
    expectPrivate(response);
    expect(repo.events).toHaveBeenCalledWith(OWNER, 20);
  });
  it('prevents caching of newly created owner alerts', async () => {
    const response = await request(app.getHttpServer())
      .post('/stocks/alerts')
      .send({ stockId: STOCK, conditionKind: 'price_at_or_above', thresholdAmount: '100' })
      .expect(201);
    expectPrivate(response);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ userId: OWNER, stockId: STOCK }));
  });
  it('prevents caching of owner alert deletion receipts', async () => {
    const response = await request(app.getHttpServer()).delete('/stocks/alerts/' + ALERT).expect(200);
    expectPrivate(response);
    expect(repo.remove).toHaveBeenCalledWith(OWNER, ALERT);
  });
});
