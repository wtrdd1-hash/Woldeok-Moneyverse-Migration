import { VersioningType } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { DerivativesController } from './derivatives.controller';

// Derivatives have no canonical position ledger or verified market feed. A mock
// must never be returned as a member's actual collateral, PnL or trade history.
describe('derivatives API provenance boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DerivativesController],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (ctx: ExecutionContext) => {
        ctx.switchToHttp().getRequest().session = { user_id: '00000000-0000-4000-8000-000000000001' };
        return true;
      } })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  for (const endpoint of ['markets', 'positions', 'history']) {
    it(`fails closed for ${endpoint} instead of publishing invented financial data`, async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/stocks/derivatives/${endpoint}`)
        .expect(503);
      expect(response.body).toMatchObject({
        code: 'DERIVATIVES_DATA_UNVERIFIED',
      });
      expect(JSON.stringify(response.body)).not.toMatch(/pos-deriv|hist-001|500000|1540000000/);
    });
  }

  it('continues to reject financial mutations before any settlement', async () => {
    await request(app.getHttpServer()).post('/api/v1/stocks/derivatives/open').send({}).expect(503);
    await request(app.getHttpServer()).post('/api/v1/stocks/derivatives/any/close').send({}).expect(503);
  });
});
