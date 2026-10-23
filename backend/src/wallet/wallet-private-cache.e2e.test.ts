import { VersioningType } from '@nestjs/common';
import type { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

const sessionGuard: CanActivate = {
  canActivate(context: ExecutionContext) {
    context.switchToHttp().getRequest().session = { user_id: 'owner-id' };
    return true;
  },
};
const allow: CanActivate = { canActivate: () => true };

describe('private wallet response cache boundary', () => {
  let app: INestApplication;
  const service = {
    overview: vi.fn(async () => ({ balances: { currency: 'WLD', totalAvailableAmount: '12345678901234567890123456789012345678' }, recent: [] })),
    searchRecipients: vi.fn(async () => []),
    rewardAvailability: vi.fn(async () => ({ available: false })),
    loans: vi.fn(async () => []),
    getCitizenTaxReceipt: vi.fn(async () => ({ entries: [] })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: service }],
    })
      .overrideGuard(SessionGuard).useValue(sessionGuard)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(allow)
      .overrideGuard(CsrfGuard).useValue(allow)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it.each([
    '/api/v1/wallet',
    '/api/v1/wallet/recipients/search?query=a',
    '/api/v1/rewards/availability',
    '/api/v1/bank/loans',
    '/api/v1/wallet/tax-receipt',
  ])('never permits shared caching for authenticated GET %s', async (path) => {
    const response = await request(app.getHttpServer()).get(path);
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('private, no-store');
  });

  it('preserves exact 38-digit WLD amounts as strings', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/wallet');
    expect(response.body.balances.totalAvailableAmount).toBe('12345678901234567890123456789012345678');
  });
});
