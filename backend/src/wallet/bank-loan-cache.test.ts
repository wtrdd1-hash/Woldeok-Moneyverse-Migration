import { HEADERS_METADATA } from '@nestjs/common/constants';
import { VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';

const OWNER = '11111111-2222-4333-8444-555555555555';
const AMOUNT = '9007199254740993';

describe('private bank loan response', () => {
  let app: INestApplication;
  const loans = [{ loanId: '22222222-3333-4444-8555-666666666666', outstandingAmount: AMOUNT }];

  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const moduleRef = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: { loans: async (actor: string) => actor === OWNER ? loans : [] } }],
    })
      .overrideGuard(SessionGuard).useValue(allow)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(allow)
      .overrideGuard(CsrfGuard).useValue(allow)
      .compile();
    app = moduleRef.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: OWNER };
      next();
    });
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('declares a no-store response for owner-scoped loan data', () => {
    const headers = Reflect.getMetadata(HEADERS_METADATA, WalletController.prototype.loans) as
      | Array<{ name: string; value: string }>
      | undefined;
    expect(headers).toContainEqual({ name: 'Cache-Control', value: 'private, no-store' });
  });

  it('returns exact integer-string loan values with a private no-store HTTP header', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/bank/loans');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.body).toEqual({ loans });
  });
});
