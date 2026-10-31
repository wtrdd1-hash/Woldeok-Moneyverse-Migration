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
describe('wallet minimum absolute WLD HTTP owner contract', () => {
  let app: INestApplication;
  const activityPage = vi.fn();
  beforeAll(async () => {
    const builder = Test.createTestingModule({ controllers: [WalletController], providers: [{ provide: WalletService, useValue: { activityPage } }] });
    builder.overrideGuard(SessionGuard).useValue({ canActivate: (ctx: { switchToHttp(): { getRequest(): { session: unknown } } }) => {
      ctx.switchToHttp().getRequest().session = { id: SESSION, user_id: OWNER }; return true;
    } });
    for (const guard of [AuthenticatedGuard, ConsentGuard, CsrfGuard]) builder.overrideGuard(guard).useValue({ canActivate: () => true });
    app = (await builder.compile()).createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app.close(); });
  it('forwards exact decimal and actor identity without exposing private results', async () => {
    activityPage.mockResolvedValueOnce({ transactions: [], hasMore: false, nextCursor: null, asOf: '2026-10-28T00:00:00.000Z' });
    const response = await request(app.getHttpServer()).get('/api/v1/wallet/activity?period=30d&direction=out&minAmount=900719925474099312345');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(activityPage).toHaveBeenCalledWith(OWNER, SESSION, '30d', undefined, 'out', undefined, '900719925474099312345');
  });
  it.each(['minAmount=1&minAmount=2', 'minAmount=01', 'minAmount=0', 'minAmount=-1', 'minAmount=1e3'])('rejects invalid threshold before service %s', async (query) => {
    const count = activityPage.mock.calls.length;
    const response = await request(app.getHttpServer()).get('/api/v1/wallet/activity?' + query);
    expect(response.status).toBe(400);
    expect(activityPage.mock.calls.length).toBe(count);
  });
});
