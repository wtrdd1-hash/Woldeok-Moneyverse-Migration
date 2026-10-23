import { Test } from '@nestjs/testing';
import type { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';

describe('recipient lookup HTTP privacy', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: { searchRecipients: async () => [] } }],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate(context: ExecutionContext) {
          context.switchToHttp().getRequest().session = { user_id: ACTOR };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('marks recipient results private and non-cacheable for Android and web consumers', async () => {
    const response = await request(app.getHttpServer()).get('/wallet/recipients/search?query=%ED%99%8D%EA%B8%B8');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.body).toEqual([]);
  });
});
