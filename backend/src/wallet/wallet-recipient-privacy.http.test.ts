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

describe('wallet recipient name search retired HTTP contract', () => {
  let app: INestApplication;
  const searchRecipients = vi.fn();
  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: { searchRecipients } }],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue({ canActivate: () => true });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app.close(); });
  it.each(['alice', '%', '_', 'a'])('returns 410 no-store and no profile read for %s', async (query) => {
    const response = await request(app.getHttpServer()).get(`/api/v1/wallet/recipients/search?query=${encodeURIComponent(query)}`);
    expect(response.status).toBe(410);
    expect(response.headers['cache-control']).toContain('no-store');
    expect(searchRecipients).not.toHaveBeenCalled();
  });
});
