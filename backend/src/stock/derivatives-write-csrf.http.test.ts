import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionRepository } from '../auth/session.repository';
import { DerivativesController } from './derivatives.controller';

const verifyCsrf = vi.fn(async (_id: string, token: string) => token === 'session-bound');

describe('derivatives member financial write HTTP CSRF boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DerivativesController],
      providers: [{ provide: SessionRepository, useValue: { verifyCsrf } }, CsrfGuard],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (context: ExecutionContext) => {
        context.switchToHttp().getRequest().session = {
          id: 'active-session', user_id: '11111111-1111-4111-8111-111111111111',
        };
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
  beforeEach(() => { vi.clearAllMocks(); });

  for (const { path, body } of [
    { path: '/api/v1/stocks/derivatives/open', body: { ticker: 'SAMPLE', side: 'LONG', leverage: 2, collateralWld: 10000, idempotencyKey: '11111111-1111-4111-8111-111111111111' } },
    { path: '/api/v1/stocks/derivatives/position-1/close', body: { idempotencyKey: '11111111-1111-4111-8111-111111111111' } },
  ]) {
    it(`denies ${path} with no CSRF`, async () => {
      await request(app.getHttpServer()).post(path).send(body).expect(403);
      expect(verifyCsrf).not.toHaveBeenCalled();
    });
    it(`denies ${path} with a token from another session`, async () => {
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'wrong').send(body).expect(403);
      expect(verifyCsrf).toHaveBeenCalledWith('active-session', 'wrong');
    });
    it(`preserves financial source hold after valid CSRF for ${path}`, async () => {
      const response = await request(app.getHttpServer()).post(path)
        .set('x-csrf-token', 'session-bound').send(body).expect(503);
      expect(verifyCsrf).toHaveBeenCalledWith('active-session', 'session-bound');
      expect(response.body.code).toBe('DERIVATIVES_DATA_UNVERIFIED');
    });
  }
});
