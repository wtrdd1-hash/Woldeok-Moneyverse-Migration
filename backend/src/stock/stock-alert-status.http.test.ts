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
describe('member alert condition filter HTTP', () => {
  let app: INestApplication;
  const list = vi.fn().mockResolvedValue([]);
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [StockAlertController], providers: [{ provide: StockAlertRepository, useValue: { list } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (ctx: ExecutionContext) => {
        ctx.switchToHttp().getRequest().session = { user_id: USER }; return true;
      } })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication(); await app.init();
  });
  afterAll(async () => { await app?.close(); });
  it('defaults to all and forwards canonical statuses for the session actor', async () => {
    list.mockClear();
    for (const suffix of ['', '?status=all', '?status=met', '?status=watching']) {
      await request(app.getHttpServer()).get('/stocks/alerts' + suffix).expect(200, { alerts: [] });
    }
    expect(list.mock.calls).toEqual([[USER, 'all'], [USER, 'all'], [USER, 'met'], [USER, 'watching']]);
  });
  it('rejects malformed, repeated or unsupported status without a DB call', async () => {
    list.mockClear();
    for (const suffix of ['?status=', '?status=active', '?status=MET', '?status=%20met', '?status=met&status=watching', '?status=met&status=met']) {
      await request(app.getHttpServer()).get('/stocks/alerts' + suffix).expect(400);
    }
    expect(list).not.toHaveBeenCalled();
  });
});
