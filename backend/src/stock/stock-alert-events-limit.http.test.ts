import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { StockAlertController } from './stock-alert.controller';
import { StockAlertRepository } from './stock-alert.repository';

const USER = '00000000-0000-4000-8000-000000000001';

describe('member stock-alert event history HTTP limit boundary', () => {
  let app: INestApplication;
  const events = vi.fn().mockResolvedValue([]);

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [StockAlertController],
      providers: [{ provide: StockAlertRepository, useValue: { events } }],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().session = { user_id: USER };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('rejects noncanonical, repeated, and out-of-range limits before owner event reads', async () => {
    events.mockClear();
    const invalid = [
      '?limit=', '?limit=%20', '?limit=0', '?limit=-1', '?limit=101',
      '?limit=001', '?limit=1e2', '?limit=0x10', '?limit=1.5',
      '?limit=2junk', '?limit=%2B1', '?limit=NaN', '?limit=Infinity',
      '?limit=9007199254740993', '?limit=1%20', '?limit=1&limit=2',
      '?limit=1&limit=1',
    ];
    for (const suffix of invalid) {
      await request(app.getHttpServer()).get('/stocks/alerts/events' + suffix).expect(400);
    }
    expect(events).not.toHaveBeenCalled();
  });

  it('preserves the default and accepts canonical 1..100 with the session owner', async () => {
    events.mockClear();
    for (const suffix of ['', '?limit=1', '?limit=100']) {
      await request(app.getHttpServer()).get('/stocks/alerts/events' + suffix)
        .expect(200, { events: [] });
    }
    expect(events.mock.calls).toEqual([[USER, 20], [USER, 1], [USER, 100]]);
  });

  it('filters only canonical owner trigger categories and rejects duplicates before SQL', async () => {
    events.mockClear();
    for (const suffix of ['?kind=price', '?kind=change', '?kind=price&limit=30']) {
      await request(app.getHttpServer()).get('/stocks/alerts/events' + suffix).expect(200);
    }
    expect(events.mock.calls).toEqual([[USER, 20, 'price'], [USER, 20, 'change'], [USER, 30, 'price']]);
    events.mockClear();
    for (const suffix of ['?kind=', '?kind=all', '?kind=PRICE', '?kind=price&kind=change', '?kind=price&kind=price']) {
      await request(app.getHttpServer()).get('/stocks/alerts/events' + suffix).expect(400);
    }
    expect(events).not.toHaveBeenCalled();
  });

});
