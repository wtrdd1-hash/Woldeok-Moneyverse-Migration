import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { WalletController } from './wallet.controller';
import { WalletService, WalletTransactionNotFoundError } from './wallet.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';

const OWNER = '11111111-1111-4111-8111-111111111111';
const TX = '55555555-5555-4555-8555-555555555555';
describe('authenticated owner transaction detail HTTP', () => {
  let app: INestApplication;
  const transactionDetail = vi.fn();
  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: { transactionDetail } }],
    });
    builder.overrideGuard(SessionGuard).useValue({
      canActivate: (ctx: { switchToHttp(): { getRequest(): { session: unknown } } }) => {
        ctx.switchToHttp().getRequest().session = {
          id: '33333333-3333-4333-8333-333333333333',
          user_id: OWNER,
        };
        return true;
      },
    });
    for (const guard of [AuthenticatedGuard, ConsentGuard, CsrfGuard])
      builder.overrideGuard(guard).useValue({ canActivate: () => true });
    const ref = await builder.compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    transactionDetail.mockReset();
  });
  it('returns exact private read-only evidence with no-referrer', async () => {
    vi.stubEnv('WALLET_TRANSACTION_DETAIL_ENABLED', 'true');
    transactionDetail.mockResolvedValueOnce({
      transactionId: TX,
      netDelta: '9007199254740993',
      readStatus: 'READ_OK',
      reconciliationStatus: 'NOT_ASSESSED',
    });
    const response = await request(app.getHttpServer()).get(
      '/api/v1/wallet/activity/transactions/' + TX,
    );
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
    expect(response.body.netDelta).toBe('9007199254740993');
    expect(transactionDetail).toHaveBeenCalledWith(OWNER, TX);
  });
  it('rejects malformed, missing, disabled and source faults without exposing a transaction', async () => {
    vi.stubEnv('WALLET_TRANSACTION_DETAIL_ENABLED', 'true');
    expect(
      (await request(app.getHttpServer()).get('/api/v1/wallet/activity/transactions/invalid'))
        .status,
    ).toBe(400);
    transactionDetail.mockRejectedValueOnce(new WalletTransactionNotFoundError());
    const missing = await request(app.getHttpServer()).get(
      '/api/v1/wallet/activity/transactions/' + TX,
    );
    expect(missing.status).toBe(404);
    expect(missing.headers['cache-control']).toBe('private, no-store');
    expect(missing.headers['x-robots-tag']).toBe('noindex');
    expect(missing.headers['referrer-policy']).toBe('no-referrer');
    transactionDetail.mockRejectedValueOnce(new Error('private SQL details'));
    const bad = await request(app.getHttpServer()).get(
      '/api/v1/wallet/activity/transactions/' + TX,
    );
    expect(bad.status).toBe(503);
    expect(JSON.stringify(bad.body)).not.toContain('private SQL');
    vi.stubEnv('WALLET_TRANSACTION_DETAIL_ENABLED', 'false');
    expect(
      (await request(app.getHttpServer()).get('/api/v1/wallet/activity/transactions/' + TX)).status,
    ).toBe(503);
    expect(transactionDetail).toHaveBeenCalledTimes(2);
  });
});
