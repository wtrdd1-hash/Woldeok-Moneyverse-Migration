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

const ACTOR = '11111111-1111-4111-8111-111111111111';
const KEY = '44444444-4444-4444-8444-444444444444';
const TX = '55555555-5555-4555-8555-555555555555';
const RECIPIENT = '22222222-2222-4222-8222-222222222222';

describe('wallet owner transfer receipt HTTP contract', () => {
  let app: INestApplication;
  const transferReceipt = vi.fn();
  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: { transferReceipt } }],
    });
    builder.overrideGuard(SessionGuard).useValue({ canActivate: (ctx: { switchToHttp(): { getRequest(): { session: unknown } } }) => {
      ctx.switchToHttp().getRequest().session = { user_id: ACTOR };
      return true;
    } });
    for (const guard of [AuthenticatedGuard, ConsentGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue({ canActivate: () => true });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app.close(); });

  it('returns committed receipt only for authenticated owner with private no-store', async () => {
    transferReceipt.mockResolvedValueOnce({ status: 'committed', transactionId: TX, recipientUserId: RECIPIENT, amount: '100' });
    const response = await request(app.getHttpServer()).get(`/api/v1/wallet/transfers/receipts/${KEY}`);
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.body).toEqual({ status: 'committed', transactionId: TX, recipientUserId: RECIPIENT, amount: '100' });
    expect(transferReceipt).toHaveBeenCalledWith(ACTOR, KEY);
  });
  it('reports unknown rather than a fabricated failed/success receipt', async () => {
    transferReceipt.mockResolvedValueOnce({ status: 'unknown' });
    const response = await request(app.getHttpServer()).get(`/api/v1/wallet/transfers/receipts/${KEY}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'unknown' });
    expect(response.headers['cache-control']).toContain('no-store');
  });
  it('rejects malformed idempotency key before calling service', async () => {
    const calls = transferReceipt.mock.calls.length;
    const response = await request(app.getHttpServer()).get('/api/v1/wallet/transfers/receipts/not-a-uuid');
    expect(response.status).toBe(400);
    expect(transferReceipt.mock.calls.length).toBe(calls);
  });
  it('fails closed with 503 on unavailable or corrupt ledger evidence', async () => {
    transferReceipt.mockRejectedValueOnce(new Error('private database detail'));
    const response = await request(app.getHttpServer()).get(`/api/v1/wallet/transfers/receipts/${KEY}`);
    expect(response.status).toBe(503);
    expect(JSON.stringify(response.body)).not.toContain('private database detail');
    expect(response.headers['cache-control']).toContain('no-store');
  });
});
