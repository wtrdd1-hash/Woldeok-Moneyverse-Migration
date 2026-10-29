import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '33333333-3333-4333-8333-333333333333';
describe('wallet activity direction authenticated HTTP contract', () => {
  let app: INestApplication;
  const activityPage = vi.fn();
  beforeAll(async () => {
    const builder = Test.createTestingModule({ controllers: [WalletController], providers: [{ provide: WalletService, useValue: { activityPage } }] });
    builder.overrideGuard(SessionGuard).useValue({ canActivate: (ctx: { switchToHttp(): { getRequest(): { session: unknown } } }) => {
      ctx.switchToHttp().getRequest().session = { id: SESSION, user_id: OWNER };
      return true;
    } });
    for (const guard of [AuthenticatedGuard, ConsentGuard, CsrfGuard]) builder.overrideGuard(guard).useValue({ canActivate: () => true });
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app.close(); });
  it('returns owner-only exact decimal strings with no-store/noindex and forwards canonical direction', async () => {
    activityPage.mockResolvedValueOnce({ transactions: [{ transactionId: '55555555-5555-4555-8555-555555555555', netAmount: '-9007199254740993' }], hasMore: false, nextCursor: null, asOf: '2026-10-28T00:00:00.000Z' });
    const res = await request(app.getHttpServer()).get('/api/v1/wallet/activity?period=30d&direction=out');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.body.transactions[0].netAmount).toBe('-9007199254740993');
    expect(activityPage).toHaveBeenCalledWith(OWNER, SESSION, '30d', undefined, 'out');
  });
  it.each(['direction=in&direction=out', 'direction=invalid', 'direction=out%26limit%3D5000'])('rejects %s before DB/service', async (query) => {
    const calls = activityPage.mock.calls.length;
    const res = await request(app.getHttpServer()).get(`/api/v1/wallet/activity?${query}`);
    expect(res.status).toBe(400);
    expect(activityPage.mock.calls.length).toBe(calls);
  });
});
